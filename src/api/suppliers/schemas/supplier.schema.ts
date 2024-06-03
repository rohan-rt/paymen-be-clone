import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';

// Import schemas
import { Team, TeamDocument } from 'api/teams/schemas/team.schema';
import { SupplierInvitationDocument } from 'api/supplier-invitations/schemas/supplier-invitation.schema';

// Import models
import { SupplierSettingsType } from '../models/supplier-settings.model';
import { SupplierPropertiesType } from '../models/supplier-properties.model';
import { UserType } from 'api/users/models/user.model';
import { MemberType } from 'api/members/models/member.model';

export enum EnumSupplierStatus {
    PENDING = 'PENDING',
    AWAITING = 'AWAITING',
    EXPIRED = 'EXPIRED',
    ACCEPTED = 'ACCEPTED',
    DECLINED = 'DECLINED',
    DISABLED = 'DISABLED',
    DELETED = 'DELETED',
}

export enum EnumSupplierPropertyCategory {
    INVOICE = 'INVOICE',
}

export enum EnumSupplierPropertyType {
    DATE_FORMAT = 'DATE_FORMAT', // Typically used to distinguish for ambiguity between day and month (e.g. D/M/YYYY and M/D/YYYY)
    DUE_DAYS = 'DUE_DAYS', // Last used amount of 'due days to payment'
}

@Schema()
// Team already extends Common
export class Supplier extends Team {
    @Prop({
        type: String,
        enum: EnumSupplierStatus,
        required: false,
        default: EnumSupplierStatus.PENDING,
    })
    status: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, required: false, ref: 'Team' })
    team: TeamDocument;

    @Prop({ type: mongoose.Schema.Types.ObjectId, required: false, ref: 'Team' })
    supplier: TeamDocument;

    @Prop({ type: mongoose.Schema.Types.ObjectId, required: false, ref: 'SupplierInvitation' })
    invitation: SupplierInvitationDocument;

    @Prop({
        type: SupplierSettingsType,
        required: false,
        default: undefined, // Avoid empty arrays being saved with this
    })
    settings: Array<SupplierSettingsType>;

    @Prop({
        type: SupplierPropertiesType,
        required: false,
        default: undefined, // Avoid empty arrays being saved with this
    })
    properties: Array<SupplierPropertiesType>;

    @Prop({
        type: MemberType,
        required: false,
        default: undefined,
    })
    subscribers: Array<MemberType>;
}

export type SupplierDocument = Supplier & Document;

export const SupplierSchema = SchemaFactory.createForClass(Supplier);

SupplierSchema.index({ team: 1, status: 1 }, { sparse: true });
