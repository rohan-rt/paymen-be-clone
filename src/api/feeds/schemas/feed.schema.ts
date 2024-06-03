import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';

// Import schemas
import { Common } from 'common/schemas/common.schema';
import { TeamDocument } from 'api/teams/schemas/team.schema';
import { PortalDocument, PortalSchema } from 'api/portals/schemas/portal.schema';
import { FeedUpdatesType } from 'api/feeds/models/feed-updates.model';
import { InvoiceTypeType } from 'api/portals/models/invoice-type.model';
import { SupplierDocument } from 'api/suppliers/schemas/supplier.schema';
import { UserDocument } from 'api/users/schemas/user.schema';
import { TeamInvitationType } from 'api/team-invitations/models/team-invitation.model';
import { InvoiceDocument } from 'api/invoices/schemas/invoice.schema';
import { EmailDocument } from 'api/emails/schema/email.schema';
import { FeedType } from '../models/feed.model';

export enum EnumFeedType {
    PORTAL = 'PORTAL',
    SUPPLIER = 'SUPPLIER',
    INVOICE = 'INVOICE',
    EMAIL = 'EMAIL',
    TEAM = 'TEAM',
}

export enum EnumFeedSubType {
    ALL = 'ALL',
    COMMENT = 'COMMENT', //If any user added a comment in the feed
    EVENT = 'EVENT',
    NOTE = 'NOTE', //If any user added a note in the feed

    // INVITE CONSTANTS
    INVITE_SENT = 'INVITE_SENT',
    INVITE_DISABLED = 'INVITE_DISABLED',
    INVITE_ENABLED = 'INVITE_ENABLED',
    INVITE_ACCEPTED = 'INVITE_ACCEPTED',
    INVITE_DECLINED = 'INVITE_DECLINED',
    INVITE_REVOKED = 'INVITE_REVOKED',

    // PORTAL CONSTANTS
    PORTAL_CREATED = 'PORTAL_CREATED',
    PORTAL_UPDATED = 'PORTAL_UPDATED',
    PORTAL_DELETED = 'PORTAL_DELETED',
    INVOICE_TYPE_ADDED = 'INVOICE_TYPE_ADDED',
    INVOICE_TYPE_DELETED = 'INVOICE_TYPE_DELETED',
    INVOICE_TYPE_UPDATED = 'INVOICE_TYPE_UPDATED',

    // SUPPLIER CONSTANTS
    SUPPLIER_CREATED = 'SUPPLIER_CREATED',
    SUPPLIER_UNLINKED = 'SUPPLIER_UNLINKED',
    SUPPLIER_PORTAL_ASSIGNED = 'SUPPLIER_PORTAL_ASSIGNED',
    SUPPLIER_PORTAL_REMOVED = 'SUPPLIER_PORTAL_REMOVED',
    SUPPLIER_INV_TYPE_UPDATED = 'SUPPLIER_INV_TYPE_UPDATED',
    SUPPLIER_UPDATED = 'SUPPLIER_UPDATED',
    SUPPLIER_DELETED = 'SUPPLIER_DELETED',

    // INVOICE CONSTANTS
    INVOICE_ADDED = 'INVOICE_ADDED',
    INVOICE_UPDATED = 'INVOICE_UPDATED',
    INVOICE_STATUS_UPDATE = 'INVOICE_STATUS_UPDATE',
    INVOICE_FILE_UPLOAD = 'INVOICE_FILE_UPLOAD',
    INVOICE_FILE_DELETE = 'INVOICE_FILE_DELETE',
    INVOICE_IT_UPDATE = 'INVOICE_IT_UPDATE',
    INVOICE_PORTAL_UPDATE = 'INVOICE_PORTAL_UPDATE',
    INVOICE_UPDATE_PRIMARY = 'INVOICE_UPDATE_PRIMARY',

    // EMAIL CONSTANTS
    EMAIL_STATUS_UPDATE = 'EMAIL_STATUS_UPDATE',
    EMAIL_UPDATE = 'EMAIL_UPDATE',
    EMAIL_LINK = 'EMAIL_LINK', // Only for accepting emails into existing invoices
    EMAIL_UNLINK = 'EMAIL_UNLINK', // Also only for archiving/unlink away from existing invoices

    // TEAM CONSTANTS
    TEAM_UPDATED = 'TEAM_UPDATED',
    TEAM_MEMBER_REMOVED = 'MEMBER_REMOVED',
    TEAM_DELETED = 'TEAM_DELETED',
    TEAM_REINSTATED = 'TEAM_REINSTATED',
}

@Schema()
export class Feed extends Common {
    @Prop({
        type: String,
        enum: EnumFeedType,
        required: true,
    })
    type: string;

    @Prop({
        type: String,
        enum: EnumFeedSubType,
        required: true,
    })
    subType: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, required: false, ref: 'Portal' })
    portal: PortalDocument;

    @Prop({ type: mongoose.Schema.Types.ObjectId, required: false, ref: 'Email' })
    email: EmailDocument;

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Invoice',
    })
    invoice: InvoiceDocument;

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier',
    })
    supplier: SupplierDocument;

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
    })
    team: TeamDocument;

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    })
    member: UserDocument;

    @Prop({
        type: TeamInvitationType,
        required: false,
        ref: 'TeamInvitation',
    })
    invitee: TeamInvitationType;

    @Prop({
        type: mongoose.Schema.Types.Mixed,
        required: false,
    })
    context?: any;

    // Comments

    @Prop({
        type: String,
        required: false,
    })
    body: string;

    @Prop({
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User',
        required: false,
        default: undefined,
    })
    mentions: Array<string>;

    @Prop({
        type: FeedType,
        required: false,
    })
    replies: Array<FeedDocument>;

    @Prop({
        type: Boolean,
        required: false,
        default: undefined,
    })
    edited?: boolean;

    @Prop({ type: Date, required: false })
    editedAt: Date;
}

export type FeedDocument = Feed & Document;

export const FeedSchema = SchemaFactory.createForClass(Feed);

FeedSchema.index({ team: 1, portal: 1 }, { sparse: true });
