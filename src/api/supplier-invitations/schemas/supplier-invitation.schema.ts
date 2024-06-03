import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';

// Import schemas
import { TeamInvitation } from 'api/team-invitations/schemas/team-invitation.schema';
import { SupplierDocument } from 'api/suppliers/schemas/supplier.schema';

export enum EnumSupplierInviteStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    DECLINED = 'DECLINED',
}

@Schema()
export class SupplierInvitation extends TeamInvitation {
    // TeamInvitation already extends Common
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' })
    supplier: SupplierDocument;
}

export type SupplierInvitationDocument = SupplierInvitation & Document;

export const SupplierInvitationSchema = SchemaFactory.createForClass(SupplierInvitation);
