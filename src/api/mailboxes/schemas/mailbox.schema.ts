import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { CAt } from 'common/schemas/common-at.schema';
import { EnumPortalStatus } from 'api/portals/schemas/portal.schema';

@Schema()
export class Mailbox extends CAt {
    @Prop({ type: String })
    invoiceType: string; // ID of the invoice type

    @Prop({ type: String, required: true })
    email: string;

    @Prop({
        type: String,
        enum: EnumPortalStatus,
        required: true,
        default: EnumPortalStatus.ACTIVE,
    })
    status: string;

    @Prop({ type: String })
    secondaryAddress?: string;
}

export type MailboxDocument = Mailbox & Document;

export const MailboxSchema = SchemaFactory.createForClass(Mailbox);
