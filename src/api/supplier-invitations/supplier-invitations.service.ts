import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
const mongoose = require('mongoose');

// Import configs
import config from 'config';

// Import services
import { UtilService } from 'utils/util.service';
import { NotificationsService } from 'api/notifications/notifications.service';
import { UsersService } from 'api/users/users.service';
import { TeamsService } from 'api/teams/teams.service';
import { EmailService } from 'services/emails/email.service';
import { SuppliersService } from 'api/suppliers/suppliers.service';
import { FeedsService } from 'api/feeds/feeds.service';

// Import inputs
import { SupplierInvitationInput } from './input/supplier-invitation.input';

// Import schemas
import { UserDocument } from 'api/users/schemas/user.schema';
import { TeamDocument } from 'api/teams/schemas/team.schema';
import { EnumSupplierStatus, SupplierDocument } from 'api/suppliers/schemas/supplier.schema';
import {
    EnumSupplierInviteStatus,
    SupplierInvitationDocument,
} from './schemas/supplier-invitation.schema';
import {
    EnumNotifStatus,
    EnumNotifType,
    NotificationDocument,
} from 'api/notifications/schemas/notification.schema';

// Import models
import { SupplierType } from 'api/suppliers/models/supplier.model';
import { InviteResponseType } from 'common/models/invite-response.model';

// Import lodash and helpers
import * as pick from 'lodash/pick';
import { getRecentEmail } from 'helpers/invites.helper';
import { EnumFeedSubType, EnumFeedType } from 'api/feeds/schemas/feed.schema';

const populate = ['invitee', 'team', 'supplier', 'updatedBy', 'createdBy'];

@Injectable()
export class SupplierInvitationsService {
    constructor(
        @InjectModel('SupplierInvitation')
        private readonly supplierInvitationModel: Model<SupplierInvitationDocument>,
        @InjectModel('Supplier') private readonly supplierModel: Model<SupplierDocument>,
        @InjectModel('User') private readonly userModel: Model<UserDocument>,

        private readonly utilService: UtilService,
        private readonly emailService: EmailService,
        private readonly notificationsService: NotificationsService,

        @Inject(forwardRef(() => FeedsService))
        private readonly feedsService: FeedsService,
        private readonly usersService: UsersService,
        @Inject(forwardRef(() => TeamsService)) private readonly teamsService: TeamsService,
        @Inject(forwardRef(() => SuppliersService))
        private readonly suppliersService: SuppliersService,
    ) {}

    async getSupplierInvites(teamId: string): Promise<SupplierInvitationDocument[]> {
        const { PENDING, DECLINED } = EnumSupplierInviteStatus;
        const res = await this.supplierInvitationModel
            .find({
                team: mongoose.Types.ObjectId(teamId),
                $or: [{ status: PENDING }, { status: DECLINED }],
            })
            .populate(populate);
        return res;
    }

    async getSupplierInviteByToken(token: string): Promise<SupplierInvitationDocument> {
        const res = await this.supplierInvitationModel.findOne({ token }).populate(populate);
        return res;
    }

    async getSupplierInviteById(_id: string): Promise<SupplierInvitationDocument> {
        const res = await this.supplierInvitationModel.findOne({ _id }).populate(populate);
        return res;
    }

    async getSupplierInvitesByEmail(email: string): Promise<SupplierInvitationDocument[]> {
        const res = await this.supplierInvitationModel
            .find({ $or: [{ inviteeEmail: email }, { inviteeNewEmail: email }] })
            .populate(populate);
        return res;
    }

    async sendSupplierInvite(input: SupplierInvitationInput): Promise<SupplierType> {
        const invite = await this.inviteSuppliers([input]);
        const { _id, supplier, updatedBy } = invite;
        const payload = {
            _id: String(supplier),
            invitation: String(_id),
            status: EnumSupplierStatus.AWAITING,
            updatedBy: String(updatedBy),
        };
        await this.feedsService.createFeed({
            supplier: input.supplierId,
            type: EnumFeedType.SUPPLIER,
            subType: EnumFeedSubType.INVITE_SENT,
            userId: input.invitorId,
            team: input.teamId,
        });
        return await this.suppliersService.updateSupplier(payload);
    }

    async inviteSuppliers(inputs: SupplierInvitationInput[]): Promise<SupplierInvitationDocument> {
        const u = inputs[0]?.invitorId;
        if (!u) throw 'INVITE_SUPPLIERS.NO_USER';
        const t = inputs[0]?.teamId;
        if (!t) throw 'INVITE_SUPPLIERS.NO_TEAM';
        const user = await this.usersService.getUserById(u);
        if (!user) throw 'INVITE_SUPPLIERS.INVALID_USER';
        const team = await this.teamsService.getTeamById(t);
        if (!team) throw 'INVITE_SUPPLIERS.INVALID_TEAM';
        const invites = [];
        const emails = [];
        const feeds = [];
        const now = new Date();
        for (let i = 0; i < inputs.length; i++) {
            const input = inputs[i];
            const { teamId, supplierId, supplierName, inviteeEmail, invitorId } = input;
            const by = mongoose.Types.ObjectId(invitorId);
            // Check if any previous invitation for this supplier exists
            const exists = await this.supplierInvitationModel.findOne({
                inviteeEmail,
                team: mongoose.Types.ObjectId(teamId),
                supplier: mongoose.Types.ObjectId(supplierId),
            });
            // If so, abort the creation process and return the found record
            if (exists) {
                invites.push(exists);
                continue;
            }

            // === Create a JWT
            const _id = input?._id || mongoose.Types.ObjectId();
            const payload: object = {
                _id,
                inviteeEmail,
                supplier: supplierId,
                invitor: invitorId,
                team: teamId,
            };
            const token: any = this.utilService.createToken(payload);
            const invite = new this.supplierInvitationModel({
                _id,
                token,
                team: teamId,
                inviteeEmail,
                invitor: by,
                supplier: supplierId,
                createdAt: now,
                createdBy: by,
                updatedAt: now,
                updatedBy: by,
            });
            // Check whether the invitee already exists as Paymen user
            // and, if so, link the ID
            // TODO: Replace with index search!
            const invitee = await this.userModel.findOne({ email: inviteeEmail });
            if (invitee) invite.invitee = invitee._id;
            invites.push(invite);
            invite.supplier.name = supplierName;
            emails.push(invite);
            feeds.push(supplierId);
        }

        // 2 -- Push supplier invites to DB
        const res = await this.supplierInvitationModel.insertMany(invites);
        if (!res.length) throw 'INVITE_SUPPLIERS.WRITE_FAILED';

        // 3 -- Send out emails
        for (let e = 0; e < emails?.length; e++) {
            // ! Ensure full team and updatedBy objects are used
            const inv = emails[e];
            inv.team = team;
            inv.updatedBy = user;
            await this.sendSupplierInviteEmail(inv);
        }

        // 4 -- Foresee supplier invite feed items
        // TODO: Implement the commented out function below
        const options = { supType: EnumFeedSubType.INVITE_SENT, userId: u, teamId: t };
        // ! const resFeeds= await this.feedsService.createSupplierFeeds(feeds, ! options);

        // 5 -- Return result
        return invites[0];
    }

    async resendSupplierInvite(supplierInvite: SupplierInvitationInput): Promise<SupplierType> {
        // Only by 'token' and not via '_id' of invite!
        const invite = await this.reinviteSupplier(supplierInvite);
        if (!invite) throw 'RESEND_SUPPLIER_INVITE.INVALID_INVITE';
        const payload = {
            _id: String(invite.supplier),
            invitation: invite._id,
            status: EnumSupplierStatus.AWAITING,
            updatedBy: String(invite.updatedBy),
        };
        return await this.suppliersService.updateSupplier(payload);
    }

    async reinviteSupplier(invite: SupplierInvitationInput): Promise<SupplierInvitationDocument> {
        const now = new Date();
        const by = mongoose.Types.ObjectId(invite.invitorId);

        // Create feed item in supplier-invitations feed
        //TODO : FEED
        // await this.feedsService.createFeed({
        //     supplierId: invite.supplierId,
        //     supType: EnumFeedSupType.INVITE_SENT,
        //     userId: by,
        //     teamId: invite.teamId,
        // });

        return await this.supplierInvitationModel.findOneAndUpdate(
            { token: invite.token },
            {
                invitor: by,
                status: EnumSupplierInviteStatus.PENDING,
                updatedAt: now,
                updatedBy: by,
            },
            { new: true },
        );
    }

    async sendSupplierInviteEmail(invite: SupplierInvitationDocument): Promise<boolean> {
        try {
            // const inv = invite ? invite : await this.getSupplierInviteByToken(token);
            const { token, supplier, team, updatedBy } = invite;
            const email = getRecentEmail(invite);
            return await this.emailService.sendSupplierInvite(
                { email, supplierName: supplier.name },
                token,
                { teamName: team.name, firstName: updatedBy.firstName },
            );
        } catch (err) {
            throw err;
        }
    }

    // Obj must contain inviteToken AND is only meant for invitee-based updates!
    async updateSupplierInvite(obj: SupplierInvitationInput): Promise<SupplierInvitationDocument> {
        const invite: any = { token: obj.token };

        // If inviteeEmail is passed through via obj, then include it for update
        if (obj.inviteeEmail) invite.inviteeEmail = obj.inviteeEmail;

        // If inviteeNewEmail is passed through via obj, then include it for update
        if (obj.inviteeNewEmail) invite.inviteeNewEmail = obj.inviteeNewEmail;

        // If inviteeId is passed through via obj, then include invitee for update
        if (obj.inviteeId) invite.invitee = mongoose.Types.ObjectId(obj.inviteeId);

        // If status is passed through via obj, then include status for update
        if (obj.status) invite.status = obj.status;

        // If inviteeUpdatedAt is passed through via obj, then include inviteeUpdatedAt for update
        // If not create new timestamp of now
        if (!obj.inviteeUpdatedAt) invite.inviteeUpdatedAt = new Date();
        else invite.inviteeUpdatedAt = obj.inviteeUpdatedAt;

        return await this.supplierInvitationModel
            .findOneAndUpdate({ token: invite.token }, { $set: invite }, { new: true })
            .populate(populate);
    }

    async revokeSupplierInvite(
        token: string,
        userId: string,
        teamId: string,
    ): Promise<SupplierType> {
        const invite = await this.getSupplierInviteByToken(token);
        if (!invite) return null;
        await this.supplierInvitationModel.deleteOne({ token });
        const data = {
            _id: invite.supplier._id,
            status: EnumSupplierStatus.PENDING, // Reset to 'Pending'
            $unset: { invitation: 1 }, // Remove invitation reference
            updatedBy: userId,
        };
        const supplier = await this.suppliersService.updateSupplier(data);
        // Create feed item in supplier-invitations feed
        await this.feedsService.createFeed({
            supplier: invite.supplier._id,
            type: EnumFeedType.SUPPLIER,
            subType: EnumFeedSubType.INVITE_REVOKED,
            userId: userId,
            team: teamId,
        });
        return supplier;
    }

    async toggleSupplierInvite(
        supplierId: string,
        userId: string,
        teamId: string,
    ): Promise<SupplierType> {
        const supp = await this.suppliersService.getSupplierById(supplierId);
        if (!supp) throw 'TOGGLE_SUPPLIER_INVITE.SUPPLIER_NOT_FOUND';
        if (supp.status === EnumSupplierStatus.ACCEPTED)
            throw 'TOGGLE_SUPPLIER_INVITE.ALREADY_CONNECTED';
        const token = supp?.invitation?.token;
        if (token) await this.supplierInvitationModel.deleteOne({ token });
        // Toggle to either 'PENDING' or 'DISABLED'
        const status =
            supp.status === EnumSupplierStatus.DISABLED
                ? EnumSupplierStatus.PENDING
                : EnumSupplierStatus.DISABLED;
        const data = {
            _id: supp._id,
            status,
            $unset: { invitation: 1 }, // Remove invitation reference
            updatedBy: userId,
        };
        const supplier = await this.suppliersService.updateSupplier(data);

        // Create feed item in supplier-invitations feed
        await this.feedsService.createFeed({
            supplier: supp._id,
            type: EnumFeedType.SUPPLIER,
            subType:
                status === EnumSupplierStatus.DISABLED
                    ? EnumFeedSubType.INVITE_DISABLED
                    : EnumFeedSubType.INVITE_ENABLED,
            userId: userId,
            team: teamId,
        });
        return supplier;
    }

    async acceptSupplierInvite(token: string, teamId: string): Promise<InviteResponseType> {
        // 1 -- Check token
        const decodedToken: any = this.utilService.verifyToken(token);
        if (!decodedToken) return new InviteResponseType('INVITE.SUPPLIER.TOKEN_INVALID');

        // 2 -- Check invitee
        const inv = await this.getSupplierInviteById(decodedToken._id);
        if (!inv) return new InviteResponseType('INVITE.SUPPLIER.INVITE_EXPIRED');
        else if (!inv.invitee) return new InviteResponseType('INVITE.SUPPLIER.NO_INVITEE');

        // 3 -- Check if supplier team and client team are already connected!
        const tid = mongoose.Types.ObjectId(teamId);
        const connected = await this.supplierModel.find({
            $and: [{ team: inv.team._id }, { supplier: tid }],
        });
        if (connected.length) return new InviteResponseType('INVITE.SUPPLIER.ALREADY_CONNECTED');

        // 4 -- Update supplier invite
        const now = new Date();
        const set = {
            token,
            status: EnumSupplierInviteStatus.ACCEPTED,
            inviteeUpdatedAt: now,
        };
        await this.updateSupplierInvite(set);

        // 5 -- Update supplier
        const sup = await this.supplierModel
            .findOneAndUpdate(
                { _id: inv.supplier._id },
                {
                    status: EnumSupplierStatus.ACCEPTED,
                    supplier: tid,
                    // Don't add updatedAt as there is no updatedBy applicable here
                },
                { new: true },
            )
            .populate(['team', 'supplier']);

        // Create feed item in supplier-invitations feed
        // For Supplier
        await this.feedsService.createFeed({
            supplier: inv.supplier._id,
            type: EnumFeedType.SUPPLIER,
            subType: EnumFeedSubType.INVITE_ACCEPTED,
            userId: String(inv.invitee._id),
            team: teamId,
        });

        // 5 -- Add notif to DB and return it
        const message = 'INVITE.SUPPLIER.ACCEPTED';
        const notification = await this.createNotif(
            inv,
            EnumNotifStatus.ACCEPTED,
            now,
            sup.supplier, // Pass team with with which supplier accepted
        );
        return new InviteResponseType(message, notification);
    }

    async declineSupplierInvite(token: string): Promise<InviteResponseType> {
        // 1 -- Check token
        const decodedToken: any = this.utilService.verifyToken(token);
        if (!decodedToken) return new InviteResponseType('INVITE.SUPPLIER.TOKEN_INVALID');

        // 2 -- Check invitee
        const inv = await this.getSupplierInviteById(decodedToken._id);
        if (!inv) return new InviteResponseType('INVITE.SUPPLIER.INVITE_EXPIRED');
        else if (!inv.invitee) return new InviteResponseType('INVITE.SUPPLIER.NO_INVITEE');

        // 3 -- Update supplier invite
        const now = new Date();
        const set = {
            token: token,
            status: EnumSupplierInviteStatus.DECLINED,
            inviteeUpdatedAt: now,
        };
        const res = await this.updateSupplierInvite(set);

        // 4 -- Update supplier
        await this.supplierModel.findOneAndUpdate(
            { _id: res.supplier._id },
            { status: EnumSupplierStatus.DECLINED },
            // Don't add updatedAt as there is no updatedBy applicable here
            { new: true },
        );

        // Create feed item in supplier-invitations feed
        await this.feedsService.createFeed({
            supplier: res.supplier._id,
            type: EnumFeedType.SUPPLIER,
            subType: EnumFeedSubType.INVITE_DECLINED,
            team: 'teamId', //TODO
        });

        // 5 -- Add notif to DB and return it
        const message = 'INVITE.SUPPLIER.DECLINED';
        const notification = await this.createNotif(res, EnumNotifStatus.DECLINED, now);
        return new InviteResponseType(message, notification);
    }

    async createNotif(
        obj: SupplierInvitationDocument,
        status: string,
        time: Date,
        sup?: TeamDocument, // 'supplierTeam' is to be passed if supplier invite accepted
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
        const supplier = pick(obj.supplier, teamAttrs);
        let notif: any = {};
        notif = {
            type: EnumNotifType.SIR,
            status,
            invitee,
            users,
            team,
            supplier,
            createdAt: time,
        };
        // If supplierInvite accepted with supplierTeam
        if (sup?._id) {
            notif.supplierTeam = {
                _id: sup._id,
                name: sup.name,
            };
        }
        return await this.notificationsService.addNotification(notif);
    }

    /* This function is executed everyday by cronjob call to clean up expired supplier invites */
    async deleteExpiredInvites(teamId?: string, supplierId?: string): Promise<boolean> {
        try {
            const now = new Date();

            let team: any = { team: mongoose.Types.ObjectId(teamId) };
            if (!teamId) team = null;

            let supplier: any = { supplier: mongoose.Types.ObjectId(supplierId) };
            if (!supplierId) supplier = null;

            // Set the date 7 days in the past
            const d = now.setDate(now.getDate() - config.intervals.DEL_EXPIRED_SUPPLIER_INVITES);
            const expiry = new Date(d);
            const condition = {
                ...team,
                ...supplier,
                status: EnumSupplierInviteStatus.PENDING, // Make sure to NOT remove 'DECLINED' invites
                updatedAt: { $lte: expiry },
            };

            // 1 -- Identify which invitations are expired
            const data = await this.supplierInvitationModel.find(condition);
            const invites = data.map((inv) => inv._id);

            // 2 -- Update involved suppliers
            const deleted = await this.supplierModel.updateMany(
                { invitation: { $in: invites } },
                { status: EnumSupplierStatus.EXPIRED },
            );
            console.log(
                '🚀 ~ file: supplier-invitations.service.ts:581 ~ SupplierInvitationsService ~ deleteExpiredInvites ~ deleted:',
                deleted,
            );

            // 3 -- Permanently remove the expired invites
            const deletedInvites = await this.supplierInvitationModel.deleteMany(condition);
            console.log(
                '🚀 ~ file: supplier-invitations.service.ts:584 ~ SupplierInvitationsService ~ deleteExpiredInvites ~ deletedInvites:',
                deletedInvites,
            );

            return true;
        } catch (err) {
            throw err;
        }
    }

    // Delete all supplier invitations related to a particular team
    async deleteInvitesByTeam(teamId: string): Promise<boolean> {
        const team = mongoose.Types.ObjectId(teamId);
        await this.supplierInvitationModel.deleteMany({ team });
        return true;
    }

    // Delete any invitation related to a particular supplier Id
    async deleteInvitesBySuppliers(supplierIds: string[]): Promise<boolean> {
        const suppliers = supplierIds.map((s) => mongoose.Types.ObjectId(s));
        await this.supplierInvitationModel.deleteMany({ supplier: { $in: suppliers } });
        return true;
    }
}
