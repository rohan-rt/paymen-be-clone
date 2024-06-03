import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';

// Import schemas
import { UserDocument, UserSchema } from 'api/users/schemas/user.schema';
import { TeamDocument, TeamSchema } from 'api/teams/schemas/team.schema';
import { PortalDocument, PortalSchema } from 'api/portals/schemas/portal.schema';
import { SupplierDocument, SupplierSchema } from 'api/suppliers/schemas/supplier.schema';
import { InvoiceDocument, InvoiceSchema } from 'api/invoices/schemas/invoice.schema';
import { NotifiedUsersType } from '../models/notified-users.model';
import { CCreated } from 'common/schemas/common-created.schema';
import { EmailDocument, EmailSchema } from 'api/emails/schema/email.schema';
import { FeedDocument, FeedSchema } from 'api/feeds/schemas/feed.schema';
import { FeedType } from 'api/feeds/models/feed.model';

export enum EnumNotifType {
    TIR = 'TIR', // Team Invite Response
    SIR = 'SIR', // Supplier Invite Response
    COMMENT = 'COMMENT',
    MENTION = 'MENTION',
    FEED_INV = 'FEED_INV', // Invoice Creation
    FEED_SUP = 'FEED_SUP', // Supplier Creation
    FEED_POR = 'FEED_POR', // Portal Creation
    FEED_TEAM = 'FEED_TEAM', // Team Creation
    NEW_EMAIL = 'NEW_EMAIL',
}

export enum EnumNotifStatus {
    ACCEPTED = 'ACCEPTED',
    DECLINED = 'DECLINED',
}

@Schema()
export class Notification extends CCreated {
    @Prop({
        type: String,
        enum: EnumNotifType,
        required: true,
    })
    type: string;

    // Mainly for team or supplier invites
    @Prop({
        type: String,
        enum: EnumNotifStatus,
        required: false,
    })
    status: string;

    // Notification should not only hold references to other documents
    // This in case  of the source reference getting delete,
    // we should still be able to display the original, historical data

    @Prop({ type: UserSchema, required: false, ref: 'User' })
    invitee: UserDocument;

    @Prop({ type: InvoiceSchema, required: false, ref: 'Invoice' })
    invoice: InvoiceDocument;

    // Is invitor in invite scenario
    @Prop({ type: NotifiedUsersType, required: false, ref: 'User' })
    users: Array<NotifiedUsersType>;

    @Prop({ type: TeamSchema, required: false, ref: 'Team' })
    team: TeamDocument;

    @Prop({ type: PortalSchema, required: false, ref: 'Portal' })
    portal: PortalDocument;

    @Prop({ type: SupplierSchema, required: false, ref: 'Supplier' })
    supplier: SupplierDocument;

    @Prop({ type: EmailSchema, required: false, ref: 'Email' })
    email: EmailDocument;

    // Team with which supplier accepted the invite
    @Prop({ type: TeamSchema, required: false, ref: 'Team' })
    supplierTeam: SupplierDocument;

    @Prop({ type: mongoose.Schema.Types.ObjectId, required: false, ref: 'Feed' })
    feed: FeedType;
}

export type NotificationDocument = Notification & Document;

export const NotificationSchema = SchemaFactory.createForClass(Notification);
