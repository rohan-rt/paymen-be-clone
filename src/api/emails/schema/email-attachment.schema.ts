import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';

// Import schemas
import { EmailDocument } from './email.schema';
import { SpacyType } from 'common/models/spacy.model';
import { Common } from 'common/schemas/common.schema';

@Schema()
export class EmailAttachment extends Common {
    @Prop({ type: String, required: false })
    name: string;

    @Prop({ type: Number, required: false })
    size: number;

    @Prop({ type: String, required: false })
    file: string;

    // Contains percentage/likelihood of the email attachments containing an invoice
    @Prop({ type: Number, required: false })
    isInvoice: number;

    @Prop({ type: Boolean, required: false })
    isPrimary: boolean;

    @Prop({ type: String, required: false })
    text_C: string;

    @Prop({ type: SpacyType, required: false })
    textLabelled_C: Array<SpacyType>;

    @Prop({ type: mongoose.Schema.Types.ObjectId, required: false, ref: 'Email' })
    email: EmailDocument;
}

export type EmailAttachmentDocument = EmailAttachment & Document;

export const EmailAttachmentSchema = SchemaFactory.createForClass(EmailAttachment);
