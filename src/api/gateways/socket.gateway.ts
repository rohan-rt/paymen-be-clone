// Import socket
import {
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    // WsResponse,
    WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

// Import configs
import config from 'config';

// Import mongoose
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

// Import schemas
import { TeamInvitationDocument } from 'api/team-invitations/schemas/team-invitation.schema';
import { MemberDocument } from 'api/members/schemas/member.schema';
import { SupplierInvitationDocument } from 'api/supplier-invitations/schemas/supplier-invitation.schema';

// Import services
import { UsersService } from 'api/users/users.service';
import { TeamInvitationsService } from 'api/team-invitations/team-invitations.service';
import { MembersService } from 'api/members/members.service';
import { SupplierInvitationsService } from 'api/supplier-invitations/supplier-invitations.service';
import { NotificationsService } from 'api/notifications/notifications.service';
import { Inject, forwardRef } from '@nestjs/common';
import { FeedDocument } from 'api/feeds/schemas/feed.schema';
import { type } from 'os';

@WebSocketGateway({
    namespace: config.keys.SOCKET.NAMESPACE,
    cors: true,
    serveClient: true,
})
export class SocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    constructor(
        @InjectModel('TeamInvitation')
        private readonly teamInvitationModel: Model<TeamInvitationDocument>,
        @InjectModel('SupplierInvitation')
        private readonly supplierInvitationModel: Model<SupplierInvitationDocument>,

        @InjectModel('Member')
        private readonly memberModel: Model<MemberDocument>,

        private readonly memberService: MembersService,
        private readonly usersService: UsersService,
        private readonly teamInvitationsService: TeamInvitationsService,
        @Inject(forwardRef(() => SupplierInvitationsService)) private readonly supplierInvitationsService: SupplierInvitationsService,
        private readonly notificationsService: NotificationsService,
    ) { }

    @WebSocketServer() wss: Server;

    afterInit(server: Server) {
        console.log('Socket Initialized!');
    }

    async handleConnection(client: Socket) {
        this.wss.emit('socketConnected', client.id);
    }

    handleDisconnect(client: Socket, ...args: any[]) {
        console.log(`Client Disconnected: ${client.id}`);
    }

    @SubscribeMessage('team-room-connection')
    async handleTeamRoomConnection(client: Socket, userId: any): Promise<void> {
        try {
            const teams = await this.memberModel.find({ user: userId });
            teams.forEach((team) => {
                const roomName = String(team.team);
                client.join(roomName);
                console.log(`User ${userId} joined room ${roomName}`);
            });
        } catch (error) {
            console.log(
                '🚀 ~ file: socket.gateway.ts ~ line 80 ~ SocketGateway ~ handleTeamsRoomsConnection ~ error',
                error,
            );
        }
    }

    // Team invite -- push & alert from invitor to invitee(s)
    @SubscribeMessage('team-invite')
    async handleTeamInvites(client: Socket, data: any): Promise<void> {
        const inviteIds = data.inviteIds;
        const invites = await this.teamInvitationModel
            .find({ $or: [{ _id: { $in: inviteIds } }] })
            .populate(['invitee', 'team', 'createdBy', 'updatedBy']);
        const userSocketIds = [];
        invites.map((e) => {
            if (e?.invitee?.socketId) userSocketIds.push(e.invitee.socketId);
        });
        userSocketIds?.map((socketId, i) => {
            if (socketId) this.wss.to(socketId).emit('push-team-invite', invites[i]);
        });
    }

    // Team invite revocation -- push & alert from invitor to invitee
    @SubscribeMessage('team-invite-revocation')
    async handleTeamRevocation(client: Socket, data: any): Promise<void> {
        const invite = await this.teamInvitationsService.getTeamInvitationById(data.idToRevoke);
        if (!invite?.invitee) return;
        const socketId = invite.invitee.socketId;
        if (socketId) this.wss.to(socketId).emit('push-team-invite-revocation', invite);
    }

    // Team invite -- push & alert from invitee to invitor
    @SubscribeMessage('team-invite-response')
    async handleTeamInviteResponse(client: Socket, data: any): Promise<void> {
        this.emitNotifications(data, 1, 'push-team-invite-response');
        // const notifId = data.notificationId;
        // const notif = await this.notificationsService.getNotificationById(notifId);
        // if (!notif?.invitee) return;
        // notif.users.map(async nu => {
        //     let invitor = await this.usersService.getUserById(nu.user._id);
        //     if (invitor?.socketId) {
        //         this.wss.to(invitor.socketId).emit('push-team-invite-response', notif);
        //     }
        // })
    }

    // Supplier invite -- push & alert from client (invitor) to supplier (invitee)
    @SubscribeMessage('supplier-invite')
    async handleSupplierInvite(client: Socket, data: any): Promise<void> {
        // const invitationId = data.invitationId;
        const inviteId = data.inviteId;
        const invite = await this.supplierInvitationModel
            .findOne({ _id: inviteId })
            .populate(['invitee', 'team', 'supplier', 'createdBy', 'updatedBy']);
        const socketId = invite.invitee?.socketId;
        if (socketId) this.wss.to(socketId).emit('push-supplier-invite', invite);
    }

    // Supplier invite revocation -- push & alert from invitor to invitee
    @SubscribeMessage('supplier-invite-revocation')
    async handleSupplierRevocation(client: Socket, data: any): Promise<void> {
        const invite = await this.supplierInvitationsService.getSupplierInviteById(data.idToRevoke);
        if (!invite?.invitee) return;
        const socketId = invite.invitee.socketId;
        if (socketId) this.wss.to(socketId).emit('push-supplier-invite-revocation', invite);
    }

    // ALERT
    @SubscribeMessage('supplier-invite-response')
    async handleSupplierInviteResponse(client: Socket, data: any): Promise<void> {
        this.emitNotifications(data, 1, 'push-supplier-invite-response');
        // const notifId = data.notificationId;
        // const notif = await this.notificationsService.getNotificationById(notifId);
        // if (!notif?.invitee) return;
        // notif.users.map(async nu => {
        //     let invitor = await this.usersService.getUserById(nu.user._id);
        //     if (invitor?.socketId) {
        //         this.wss.to(invitor.socketId).emit('push-supplier-invite-response', notif);
        //     }
        // })
    }



    // Mention -- push & alert from mentioner to the user mentioned
    @SubscribeMessage('mention')
    async handleMention(client: Socket, data: any): Promise<void> {
        this.emitNotifications(data, 1, 'push-mention');
        // const notifId = data.notificationId;
        // const notif = await this.notificationsService.getNotificationById(notifId);
        // notif.users.map(async nu => {
        //     let subscribers = await this.usersService.getUserById(nu.user._id);
        //     if (subscribers?.socketId) {
        //         this.wss.to(subscribers.socketId).emit('push-mention', notif);
        //     }
        // })
    }

    // ALERT
    // @SubscribeMessage('new-email-arrived')
    async handleEmailArrivedAlert(emailData): Promise<void> {
        try {
            console.log('emitting ');
            this.wss.to(String(emailData.teamId)).emit('alert-new-email-arrived', emailData);
        } catch (error) {
            console.log(
                '🚀 ~ file: socket.gateway.ts ~ line 80 ~ SocketGateway ~ handleTeamsRoomsConnection ~ error',
                error,
            );
        }
    }

    // Notification -- push & alert the notifications to specific users
    @SubscribeMessage('notification')
    async handleNotification(client: Socket, data: any): Promise<void> {
        this.emitNotifications(data, 1, 'push-notification');
    }

    // Broadcasst Notification -- broadcast the notifications to specific room
    @SubscribeMessage('broadcast-notification')
    async handleBroadcastNotification(client: Socket, data: any): Promise<void> {
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
                    const users = await this.usersService.getUserById(nu.user._id);
                    if (users?.socketId) this.wss.to(users.socketId)?.emit(emit, notif);
                });
                break;

            case 2:
                this.wss.to(String(notif?.team?._id)).emit(emit, notif);

            default:
                break;
        }
    }


    async feedHandler(feedAlert: FeedDocument, type: string): Promise<void> {
        const roomName = String(feedAlert?.team)
        switch (type) {
            case "DELETED":
                this.wss.to(roomName).emit("alert-feed-deleted", feedAlert);

                break;
            case "CREATED":
                this.wss.to(roomName).emit("alert-feed-created", feedAlert);

            case "UPDATED":
                this.wss.to(roomName).emit("alert-feed-updated", feedAlert);

                break;
            default:
                break;
        }


    }
}
