import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';

// Import schemas
import { Common } from 'common/schemas/common.schema';
import { UserDocument } from 'api/users/schemas/user.schema';
import { TeamDocument } from 'api/teams/schemas/team.schema';
import { PortalDocument } from 'api/portals/schemas/portal.schema';
import { EmailAttachmentDocument } from './email-attachment.schema';
import { InvoiceDocument } from 'api/invoices/schemas/invoice.schema';

// Import models
import { EmailPartsType } from '../model/email-parts.model';
import { FileType } from 'api/files/models/file.model';
import { EmailFileType } from '../model/email-file.model';

export enum EnumEmailStatus {
    NEW = 'NEW',
    ACCEPTED = 'ACCEPTED',
    ARCHIVED = 'ARCHIVED',
}

@Schema()
export class Email extends Common {
    @Prop({ type: Date, required: false })
    createdAt: Date;

    @Prop({ type: EmailPartsType, required: false })
    from: EmailPartsType;

    @Prop({ type: EmailPartsType, required: false })
    to: Array<EmailPartsType>;

    @Prop({ type: EmailPartsType, required: false })
    cc: Array<EmailPartsType>;

    @Prop({ type: String, required: false })
    subject: string;

    @Prop({ type: Date, required: false })
    date: Date;

    @Prop({ type: FileType, required: false })
    body: FileType;

    @Prop({ type: EmailFileType, required: false })
    eml: EmailFileType;

    @Prop({
        type: String,
        required: false,
        enum: EnumEmailStatus,
    })
    status: string;

    @Prop({
        type: [mongoose.Schema.Types.ObjectId],
        required: false,
        ref: 'EmailAttachment',
        default: undefined,
    })
    attachments: Array<EmailAttachmentDocument>;

    @Prop({ type: mongoose.Schema.Types.ObjectId, required: false, ref: 'Team' })
    team: TeamDocument;

    @Prop({ type: mongoose.Schema.Types.ObjectId, required: false, ref: 'Portal' })
    portal: PortalDocument;

    @Prop({ type: String, required: false })
    invoiceType: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, required: false, ref: 'Invoice' })
    invoice: InvoiceDocument;

    @Prop({ type: Date, required: false })
    linkedAt: Date;

    @Prop({ type: mongoose.Schema.Types.ObjectId, required: false, ref: 'User' })
    linkedBy: UserDocument;

    // Email treated (either accepted or archived)
    @Prop({ type: Boolean, required: false })
    treated: boolean;
}

export type EmailDocument = Email & Document;

export const EmailSchema = SchemaFactory.createForClass(Email);
