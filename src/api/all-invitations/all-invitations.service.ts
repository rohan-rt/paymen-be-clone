import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
const mongoose = require('mongoose');

// Import configs
import config from 'config';

// Import schemas
import { TeamInvitationDocument } from 'api/team-invitations/schemas/team-invitation.schema';
import { SupplierInvitationDocument } from 'api/supplier-invitations/schemas/supplier-invitation.schema';
import { EnumNotifType, NotificationDocument } from 'api/notifications/schemas/notification.schema';

// Import models
import { AllInvitationsType } from './models/all-invitations.model';

@Injectable()
export class AllInvitationsService {
    constructor(
        @InjectModel('TeamInvitation')
        private readonly teamInvitationModel: Model<TeamInvitationDocument>,
        @InjectModel('SupplierInvitation')
        private readonly supplierInvitationModel: Model<SupplierInvitationDocument>,
        @InjectModel('Notification')
        private readonly notificationModel: Model<NotificationDocument>,
    ) {}

    // inviteId used for pagination purposes
    async getAllInvitations(inviteeId: string): Promise<AllInvitationsType> {
        const data = new AllInvitationsType();

        // For Team
        data.teamInvites = await this.teamInvitationModel
            .find({
                invitee: mongoose.Types.ObjectId(inviteeId),
            })
            .sort({ updatedAt: -1 }) // Get most recent first
            .populate(['invitee', 'team', 'updatedBy', 'createdBy']);

        // For Supplier
        data.supplierInvites = await this.supplierInvitationModel
            .find({ invitee: mongoose.Types.ObjectId(inviteeId) })
            .sort({ updatedAt: -1 }) // Get most recent first
            .populate(['invitee', 'team', 'supplier', 'updatedBy', 'createdBy']);

        // For Team Invitation Response
        data.teamInviteResponses = await this.notificationModel
            .find({
                'invitee._id': mongoose.Types.ObjectId(inviteeId),
                'type': EnumNotifType.TIR,
            })
            .sort({ createdAt: -1 }) // Get most recent first
            .limit(config.constants.INVITES.FETCH_LIMIT); // Don't limit whenever getting all unseen

        // For Suppier Invitation Response
        data.supplierInviteResponses = await this.notificationModel
            .find({
                'invitee._id': mongoose.Types.ObjectId(inviteeId),
                'type': EnumNotifType.SIR,
            })
            .sort({ createdAt: -1 }) // Get most recent first
            .limit(config.constants.INVITES.FETCH_LIMIT); // Don't limit whenever getting all unseen

        return data;
    }

    async getMoreInviteResponses(
        inviteeId: string,
        tirId?: string,
        sirId?: string,
    ): Promise<AllInvitationsType> {
        const data = new AllInvitationsType();

        // tirId and sirId passed for pagination purposes
        let conTir: any = null;
        let conSir: any = null;

        if (tirId)
            conTir = {
                _id: {
                    $lt: tirId,
                },
            };

        if (sirId)
            conSir = {
                _id: {
                    $lt: sirId,
                },
            };

        // For Team Invitation Response
        data.teamInviteResponses = await this.notificationModel
            .find({
                'invitee._id': mongoose.Types.ObjectId(inviteeId),
                'type': EnumNotifType.TIR,
                ...conTir,
            })
            .sort({ createdAt: -1 }) // Get most recent first
            .limit(config.constants.INVITES.FETCH_LIMIT); // Don't limit whenever getting all unseen

        // For Suppier Invitation Response
        data.supplierInviteResponses = await this.notificationModel
            .find({
                'invitee._id': mongoose.Types.ObjectId(inviteeId),
                'type': EnumNotifType.SIR,
                ...conSir,
            })
            .sort({ createdAt: -1 }) // Get most recent first
            .limit(config.constants.INVITES.FETCH_LIMIT); // Don't limit whenever getting all unseen

        return data;
    }
}
