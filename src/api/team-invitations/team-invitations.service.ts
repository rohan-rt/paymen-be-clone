import { Inject, forwardRef, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
const mongoose = require('mongoose');

// Import configs
import config from 'config';

// Import inputs
import { TeamInvitationInput } from './inputs/team-invitation.input';

// Import schemas and enums
import { UserDocument } from 'api/users/schemas/user.schema';
import { EnumTeamInviteStatus, TeamInvitationDocument } from './schemas/team-invitation.schema';
import {
    EnumMemberStatus,
    EnumMemberRole,
    MemberDocument,
} from 'api/members/schemas/member.schema';
import {
    EnumNotifStatus,
    EnumNotifType,
    NotificationDocument,
} from 'api/notifications/schemas/notification.schema';

// Import models
import { MembersType } from 'api/members/models/members.model';
import { InviteResponseType } from 'common/models/invite-response.model';

// Import services
import { UtilService } from 'utils/util.service';
import { EmailService } from 'services/emails/email.service';
import { NotificationsService } from 'api/notifications/notifications.service';

import { UsersService } from 'api/users/users.service';
import { TeamsService } from 'api/teams/teams.service';
import { MembersService } from 'api/members/members.service';

// Import lodash and helpers
import * as pick from 'lodash/pick';
import { getRecentEmail } from 'helpers/invites.helper';
import { FeedsService } from 'api/feeds/feeds.service';
import { EnumFeedSubType, EnumFeedType } from 'api/feeds/schemas/feed.schema';

const populate = ['invitee', 'team', 'createdBy', 'updatedBy'];

@Injectable()
export class TeamInvitationsService {
    constructor(
        @InjectModel('User') private readonly userModel: Model<UserDocument>,
        @InjectModel('Member') private readonly memberModel: Model<MemberDocument>,
        @InjectModel('TeamInvitation')
        private readonly teamInvitationModel: Model<TeamInvitationDocument>,

        private readonly utilService: UtilService,
        private readonly emailService: EmailService,
        private readonly notificationsService: NotificationsService,
        private readonly usersService: UsersService,

        @Inject(forwardRef(() => FeedsService))
        private readonly feedsService: FeedsService,
        @Inject(forwardRef(() => TeamsService)) private readonly teamsService: TeamsService,
        @Inject(forwardRef(() => MembersService)) private readonly membersService: MembersService,
    ) {}

    async getTeamInvitations(teamId: string): Promise<TeamInvitationDocument[]> {
        const team = mongoose.Types.ObjectId(teamId);
        const { PENDING, DECLINED } = EnumTeamInviteStatus;
        return await this.teamInvitationModel
            .find({ team, $or: [{ status: PENDING }, { status: DECLINED }] })
            .populate(populate);
    }

    async getTeamInvitationById(_id: string): Promise<TeamInvitationDocument> {
        return await this.teamInvitationModel.findOne({ _id }).populate(populate);
    }

    async getTeamInvitationByToken(token: string): Promise<TeamInvitationDocument> {
        return await this.teamInvitationModel.findOne({ token }).populate(populate);
    }

    async getTeamInvitationsByEmail(email: string): Promise<TeamInvitationDocument[]> {
        return await this.teamInvitationModel
            .find({ $or: [{ inviteeEmail: email }, { inviteeNewEmail: email }] })
            .populate(populate);
    }

    async createTeamInvitations(inputs: TeamInvitationInput[]): Promise<boolean> {
        const u = inputs[0]?.invitorId;
        if (!u) throw 'INVITE_MEMBERS.NO_USER';
        const t = inputs[0]?.teamId;
        if (!t) throw 'INVITE_MEMBERS.NO_TEAM';
        const user = await this.usersService.getUserById(u);
        if (!user) throw 'INVITE_MEMBERS.INVALID_USER';
        const team = await this.teamsService.getTeamById(t);
        if (!team) throw 'INVITE_MEMBERS.INVALID_TEAM';
        const invites = [];
        const now = new Date();
        for (let i = 0; i < inputs.length; i++) {
            const input = inputs[i];
            const { inviteeEmail, invitorId, teamId } = input;
            // Check whether a team invite for this inviteeEmail already exists
            const exists = await this.teamInvitationModel.findOne({ inviteeEmail, teamId });
            // If so, then move on to the next item
            if (exists) {
                invites.push(exists);
                continue;
            }
            // If not, then continue with the invitation
            const invite = new this.teamInvitationModel(input);
            invite._id = mongoose.Types.ObjectId();
            invite.team = mongoose.Types.ObjectId(teamId);
            invite.createdAt = now;
            invite.createdBy = mongoose.Types.ObjectId(invitorId);
            invite.updatedAt = now;
            invite.updatedBy = mongoose.Types.ObjectId(invitorId);

            // Check whether the invitee already exists and, if so, link the ID
            const email = invite.inviteeEmail;
            const user = await this.userModel.findOne({ email });
            if (user) invite.invitee = user._id;

            const payload: object = {
                _id: invite._id,
                email,
                team: invite.team,
                updatedAt: invite.updatedAt,
            };
            const token: any = this.utilService.createToken(payload);
            invite.token = token;
            invites.push(invite);
        }

        // 2 -- Push supplier invites to DB
        const res = await this.teamInvitationModel.insertMany(invites);
        if (!res.length) throw 'INVITE_MEMBERS.WRITE_FAILED';

        // 3 -- Send out emails
        for (let e = 0; e < invites?.length; e++) {
            const { inviteeEmail, token } = invites[e];
            // ! Ensure full team and updatedBy objects are used
            this.emailService.sendTeamInvitationEmail(inviteeEmail, token, team.name);
        }

        // 4 -- Foresee supplier invite feed items
        // TODO: Foresee team feed items for invites sent out?
        // const options = { supType: EnumFeedSupType.INVITE_SENT, userId: u, teamId: t };
        // // ! const resFeeds= await this.feedsService.createSupplierFeeds(feeds, ! options);

        return true;
    }

    async sendTeamInvitations(input: TeamInvitationInput, emails: string[]): Promise<MembersType> {
        const { teamId, invitorId } = input;
        const max = config.constants.INVITES.FETCH_LIMIT;
        if (emails.length > max) throw 'SEND_TEAM_INVITES.MAX_EMAILS_EXCEEDED';
        const invites = [];
        for (let i = 0; i < emails.length; i++) {
            const email = emails[i];
            const tid = mongoose.Types.ObjectId(teamId);
            // TODO: Replace with index search for email?
            const user = await this.userModel.findOne({ email });
            if (user) {
                // TODO: Replace with index search for user?
                const member = await this.memberModel.findOne({ team: tid, user: user._id });
                if (member) continue;
            }
            const invite = { invitorId, teamId, inviteeEmail: email };
            invites.push(invite);
            // TODO: Add team feed item (MEMBER_INVITED)?
        }
        await this.createTeamInvitations(invites);

        // TODO: Adapt due to server-side pagination
        return await this.membersService.getAllTeamMembers(teamId);
    }

    async resendTeamInvitation(
        input: TeamInvitationInput,
        reinvitorId: string,
    ): Promise<TeamInvitationDocument> {
        const now = new Date();
        const email = getRecentEmail(input);
        // Update invite
        const invite = new this.teamInvitationModel(input);
        invite.updatedAt = now;
        invite.updatedBy = mongoose.Types.ObjectId(reinvitorId);

        const payload: object = {
            _id: invite._id,
            email,
            team: invite.team,
            updatedAt: invite.updatedAt,
        };
        const tkn: any = this.utilService.createToken(payload);
        invite.token = tkn;

        const { _id, token, updatedAt, updatedBy } = invite;
        const { PENDING, DECLINED } = EnumTeamInviteStatus;
        const res = await this.teamInvitationModel
            .findOneAndUpdate(
                {
                    _id,
                    $or: [{ status: PENDING }, { status: DECLINED }],
                },
                {
                    status: PENDING,
                    token,
                    updatedAt,
                    updatedBy,
                },
                { new: true },
            )
            .populate(populate);

        await this.emailService.sendTeamInvitationEmail(email, res.token, res.team.name);
        return res;
    }

    // Obj must contain inviteToken AND is only meant for invitee-based updates!
    async updateTeamInvitation(input: TeamInvitationInput): Promise<TeamInvitationDocument> {
        const invite: any = {};

        // If inviteeEmail is passed through via input, then include it for update
        if (input.inviteeEmail) invite.inviteeEmail = input.inviteeEmail;

        // If inviteeNewEmail is passed through via input, then include it for update
        if (input.inviteeNewEmail) invite.inviteeNewEmail = input.inviteeNewEmail;

        // If inviteeId is passed through via input, then include invitee for update
        if (input.inviteeId) invite.invitee = mongoose.Types.ObjectId(input.inviteeId);

        // If status is passed through via input, then include status for update
        if (input.status) invite.status = input.status;

        // If inviteeUpdatedAt is passed through via input, then include inviteeUpdatedAt for update
        // If not create new timestamp of now
        if (input.inviteeUpdatedAt) invite.inviteeUpdatedAt = input.inviteeUpdatedAt;
        else invite.inviteeUpdatedAt = new Date();

        return await this.teamInvitationModel
            .findOneAndUpdate({ token: input.token }, { $set: invite }, { new: true })
            .populate(populate);
    }

    async revokeTeamInvitation(inviteId: string): Promise<any> {
        await this.teamInvitationModel.deleteOne({ _id: inviteId });
    }

    async acceptTeamInvite(token: string): Promise<InviteResponseType> {
        // 1 -- Check token
        const decodedToken: any = this.utilService.verifyToken(token);
        if (!decodedToken) return new InviteResponseType('INVITE.TEAM.TOKEN_INVALID');

        // 2 -- Check invitee
        const inv = await this.getTeamInvitationById(decodedToken._id);
        if (!inv) return new InviteResponseType('INVITE.TEAM.INVITE_EXPIRED');
        else if (!inv.invitee) return new InviteResponseType('INVITE.TEAM.NO_INVITEE');

        // 3 -- Create member and delete teamInvite record
        const now = new Date();
        const member = {
            team: inv.team._id,
            user: inv.invitee._id,
            status: EnumMemberStatus.ACTIVE,
            role: EnumMemberRole.MEMBER,
            createdAt: now,
            createdBy: inv.updatedBy._id,
        };
        await this.membersService.addMember(member);
        await this.teamInvitationModel.deleteOne({ _id: decodedToken._id });

        // 4 -- Create notification for invitor
        const message = 'INVITE.TEAM.ACCEPTED';
        const notification = await this.createNotif(inv, EnumNotifStatus.ACCEPTED, now);
        this.feedsService.createFeed({
            type: EnumFeedType.TEAM,
            subType: EnumFeedSubType.INVITE_ACCEPTED,
            team: inv.team._id,
            userId: inv.invitee._id,
        });
        return new InviteResponseType(message, notification);
    }

    async declineTeamInvite(token: string): Promise<InviteResponseType> {
        // 1 -- Check token
        const decodedToken: any = this.utilService.verifyToken(token);
        if (!decodedToken) return new InviteResponseType('INVITE.TEAM.TOKEN_INVALID');

        // 2 -- Check invitee
        const inv = await this.getTeamInvitationById(decodedToken._id);
        if (!inv) return new InviteResponseType('INVITE.TEAM.INVITE_EXPIRED');
        else if (!inv.invitee) return new InviteResponseType('INVITE.TEAM.NO_INVITEE');

        // 3 -- Decline invitation
        const now = new Date();
        const res = await this.teamInvitationModel
            .findOneAndUpdate(
                { _id: decodedToken._id },
                { status: EnumTeamInviteStatus.DECLINED, inviteeUpdatedAt: now },
                { new: true },
            )
            .populate(['invitee', 'team', 'updatedBy']);

        // 4 -- Create notification for invitor
        const message = 'INVITE.TEAM.DECLINED';
        const notification = await this.createNotif(res, EnumNotifStatus.DECLINED, now);
        this.feedsService.createFeed({
            type: EnumFeedType.TEAM,
            subType: EnumFeedSubType.INVITE_DECLINED,
            team: inv.team._id,
            userId: inv.invitee._id,
        });
        return new InviteResponseType(message, notification);
    }

    async createNotif(
        obj: TeamInvitationDocument,
        status: string,
        time: Date,
    ): Promise<NotificationDocument> {
        const userAttrs = ['_id', 'firstName', 'lastName', 'avatarBg'];
        const teamAttrs = ['_id', 'name', 'logoBg'];
        const users = [
            {
                user: pick(obj.updatedBy, userAttrs),
                seen: false,
            },
        ];
        const invitee = pick(obj.invitee, userAttrs);
        const team = pick(obj.team, teamAttrs);
        const notif = {
            type: EnumNotifType.TIR,
            status,
            invitee,
            users,
            team,
            createdAt: time,
        };
        return await this.notificationsService.addNotification(notif);
    }

    // Delete all team invitations related to a particular team
    async deleteInvitesByTeam(teamId: string) {
        const team = mongoose.Types.ObjectId(teamId);
        return await this.teamInvitationModel.deleteMany({ team });
    }

    /* This function is executed everyday by cronjob call for member invitation */
    async deleteExpiredInvites(): Promise<boolean> {
        const now = new Date();
        // Set the date 14 days in the past
        const d = now.setDate(now.getDate() - config.intervals.DEL_EXPIRED_TEAM_INVITES);
        const expiry = new Date(d);
        await this.teamInvitationModel.deleteMany({
            status: EnumTeamInviteStatus.PENDING, // Make sure to NOT remove 'DECLINED' invites
            updatedAt: { $lte: expiry },
        });
        return true;
    }
}
