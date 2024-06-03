import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { io, Socket } from 'socket.io-client';
const mongoose = require('mongoose');

// Import Schema
import { TeamInvitationDocument } from 'api/team-invitations/schemas/team-invitation.schema';
import { SupplierInvitationDocument } from 'api/supplier-invitations/schemas/supplier-invitation.schema';
import { MemberDocument } from 'api/members/schemas/member.schema';

// Import Services
import { MembersService } from 'api/members/members.service';
import { UsersService } from 'api/users/users.service';
import { TeamInvitationsService } from 'api/team-invitations/team-invitations.service';
import { SupplierInvitationsService } from 'api/supplier-invitations/supplier-invitations.service';
import { NotificationsService } from 'api/notifications/notifications.service';
import { EnumNotifType } from 'api/notifications/schemas/notification.schema';
import { NotificationInput } from 'api/notifications/inputs/notification.input';
import { TeamDocument } from 'api/teams/schemas/team.schema';
import { PortalDocument } from 'api/portals/schemas/portal.schema';
import { EmailDocument } from 'api/emails/schema/email.schema';

// Import configs
import config from 'config';
import { FeedDocument } from 'api/feeds/schemas/feed.schema';

@Injectable()
export class SocketIoClientService {
    private socket: Socket;

    constructor(
        @InjectModel('Team')
        private readonly teamModel: Model<TeamDocument>,
        @InjectModel('Portal')
        private readonly portalModel: Model<PortalDocument>,
        @InjectModel('Email')
        private readonly emailModel: Model<EmailDocument>,
        @InjectModel('TeamInvitation')
        private readonly teamInvitationModel: Model<TeamInvitationDocument>,
        @InjectModel('SupplierInvitation')
        private readonly supplierInvitationModel: Model<SupplierInvitationDocument>,

        @InjectModel('Member')
        private readonly memberModel: Model<MemberDocument>,

        private readonly usersService: UsersService,
        private readonly notificationsService: NotificationsService,
        private readonly supplierInvitationsService: SupplierInvitationsService,

        @Inject(forwardRef(() => TeamInvitationsService))
        private readonly teamInvitationsService: TeamInvitationsService,
    ) {
        this.socket = io(config.keys.SOCKET.URI);
        this.setupListeners();
    }

    private setupListeners() {
        this.socket.on('connect', () => {
            console.log(`Connected to WebSocket server with Id: ${this.socket.id}`);
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from WebSocket server');
        });

        this.socket.on('team-room-connection', (data) => this.handleTeamRoomConnection(data));

        this.socket.on('team-invite', (data) => this.handleTeamInvites(data));

        this.socket.on('team-invite-revocation', (data) => this.handleTeamRevocation(data));

        this.socket.on('team-invite-response', (data) => this.handleTeamInviteResponse(data));

        this.socket.on('supplier-invite', (data) => this.handleSupplierInvite(data));

        // this.socket.on('supplier-invite-revocation', (data) => this.handleSupplierRevocation(data));

        this.socket.on('supplier-invite-response', (data) =>
            this.handleSupplierInviteResponse(data),
        );

        this.socket.on('feed-creation', (data) => this.handleFeedCreation(data));

        this.socket.on('mention', (data) => this.handleMention(data));

        this.socket.on('notification', (data) => this.handleNotification(data));

        this.socket.on('broadcast-notification', (data) => this.handleBroadcastNotification(data));

        this.socket.on('new-email-arrived', (data) => this.handleEmailArrivedAlert(data));
    }

    async handleTeamRoomConnection(data: any): Promise<void> {
        try {
            console.log('Team connection : ' + data.userId);
            const teams = await this.memberModel.find({ user: data.userId }).populate(['team']);
            const teamIds = [];
            teams.forEach((t) => {
                teamIds.push(String(t.team._id));
            });
            this.socket.emit('team-room-connection-api', { teamIds, clientId: data.clientId });
        } catch (error) {
            console.log(
                '🚀 ~ file: socket-io-client.service.ts ~ line 64 ~ SocketIoClientService ~ handleTeamRoomConnection ~ error',
                error,
            );
        }
    }

    async handleTeamInvites(data: any): Promise<void> {
        const inviteIds = data.inviteIds;
        const invites = await this.teamInvitationModel
            .find({ $or: [{ _id: { $in: inviteIds } }] })
            .populate(['invitee', 'team', 'createdBy', 'updatedBy']);
        const userSocketIds = [];
        invites.map((e) => {
            if (e?.invitee?.socketId) userSocketIds.push(e.invitee.socketId);
        });
        this.socket.emit('team-invite-api', { invites, userSocketIds });
    }

    async handleTeamRevocation(data: any): Promise<void> {
        const invite = await this.teamInvitationsService.getTeamInvitationById(data.idToRevoke);
        if (!invite?.invitee) return;
        this.socket.emit('team-invite-revocation-api', { invite });
    }

    async handleTeamInviteResponse(data: any): Promise<void> {
        this.emitNotifications(data, 1, 'push-team-invite-response');
    }

    async handleSupplierInvite(data: any): Promise<void> {
        const inviteId = data.inviteId;
        const invite = await this.supplierInvitationModel
            .findOne({ _id: inviteId })
            .populate(['invitee', 'team', 'supplier', 'createdBy', 'updatedBy']);

        this.socket.emit('supplier-invite-api', { invite });
    }

    async handleSupplierRevocation(data: any): Promise<void> {
        const invite = await this.supplierInvitationsService.getSupplierInviteById(data.idToRevoke);
        if (!invite?.invitee) return;
        this.socket.emit('supplier-invite-revocation-api', { invite });
    }

    async handleSupplierInviteResponse(data: any): Promise<void> {
        this.emitNotifications(data, 1, 'push-supplier-invite-response');
    }

    async handleFeedCreation(data: any): Promise<void> {
        this.emitNotifications(data, 1, 'push-feed-creation');
    }

    async handleMention(data: any): Promise<void> {
        this.emitNotifications(data, 1, 'push-mention');
    }

    async handleEmailArrivedAlert(data: any): Promise<void> {
        console.log(data, 'emitting email');
        const members = await this.memberModel
            .find({ team: mongoose.Types.ObjectId(data.team) })
            .populate('user');
        const portal = await this.portalModel.findOne({
            _id: mongoose.Types.ObjectId(data.portal),
        });

        const notifInput: NotificationInput = {
            type: EnumNotifType.NEW_EMAIL,
            team: {
                _id: members[0]?.team._id,
                name: members[0]?.team.name,
                logoBg: members[0]?.team.logoBg,
            },
            portal: {
                _id: portal?._id,
                name: portal?.name,
            },
            email: {
                _id: data._id,
                from: data.from,
                subject: data.subject,
            },
            users: members.map((m) => ({
                user: { _id: m.user._id, firstName: m.user.firstName, avatarBg: m.user.avatarBg },
                seen: false,
            })),
        };
        const notif = await this.notificationsService.addNotification(notifInput);
        this.socket.emit('new-email-arrived-api', notif);
    }

    async handleNotification(data: any): Promise<void> {
        this.emitNotifications(data, 1, 'push-notification');
    }

    // Broadcasst Notification -- broadcast the notifications to specific room
    async handleBroadcastNotification(data: any): Promise<void> {
        this.emitNotifications(data, 2, 'push-broadcast-notification');
    }

    // Showing alert of notifications
    async emitNotifications(data: any, type: number, emit: string) {
        /** Type 1 is for emiting to each socket id and 2 is for team broadcast */
        const notifId = data.notificationId;
        const notif = await this.notificationsService.getNotificationById(notifId);
        switch (type) {
            case 1:
                notif?.users?.map(async (nu) => {
                    const user = await this.usersService.getUserById(nu.user._id);
                    console.log(nu.user._id, '\n', user);
                    if (user?.socketId) {
                        this.socket.emit('emit-notifications-api', {
                            emit,
                            notif,
                            socketId: user.socketId,
                        });
                    }
                });
                break;

            case 2:
                this.socket.emit('emit-notifications-api', {
                    emit,
                    notif,
                    socketId: notif?.team?._id,
                });
                break;

            default:
                break;
        }
    }

    async feedHandler(feedAlert: FeedDocument, type: string): Promise<void> {
        const roomName = String(feedAlert?.team);
        switch (type) {
            case 'DELETED':
                this.socket.emit('feed-handler-api', {
                    emit: 'alert-feed-deleted',
                    feedAlert,
                    socketId: roomName,
                });

                break;
            case 'CREATED':
                this.socket.emit('feed-handler-api', {
                    emit: 'alert-feed-created',
                    feedAlert,
                    socketId: roomName,
                });

                break;
            case 'UPDATED':
                this.socket.emit('feed-handler-api', {
                    emit: 'alert-feed-updated',
                    feedAlert,
                    socketId: roomName,
                });

                break;
            case 'DELETED_R':
                this.socket.emit('feed-handler-api', {
                    emit: 'alert-feed-reply-deleted',
                    feedAlert,
                    socketId: roomName,
                });

                break;
            case 'CREATED_R':
                this.socket.emit('feed-handler-api', {
                    emit: 'alert-feed-reply-created',
                    feedAlert,
                    socketId: roomName,
                });

                break;
            case 'UPDATED_R':
                this.socket.emit('feed-handler-api', {
                    emit: 'alert-feed-reply-updated',
                    feedAlert,
                    socketId: roomName,
                });

                break;
            default:
                break;
        }
    }
}
