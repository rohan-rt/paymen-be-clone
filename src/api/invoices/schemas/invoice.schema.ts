import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';

// Import schemas
import { Common } from 'common/schemas/common.schema';
import { TeamDocument } from 'api/teams/schemas/team.schema';
import { PortalDocument } from 'api/portals/schemas/portal.schema';
import { SupplierDocument } from 'api/suppliers/schemas/supplier.schema';
import { FileDocument } from 'api/files/schemas/file.schema';
import { EmailDocument } from 'api/emails/schema/email.schema';
import { UserDocument } from 'api/users/schemas/user.schema';
import { MemberType } from 'api/members/models/member.model';

export enum EnumInvoiceStatus {
    NEW = 'NEW',
    IN_APPROVAL = 'IN_APPROVAL',
    APPROVED = 'APPROVED',
    PAID = 'PAID',
    ARCHIVED = 'ARCHIVED',
}

@Schema()
export class Invoice extends Common {
    @Prop({ type: mongoose.Schema.Types.ObjectId, required: false, ref: 'Team' })
    team: TeamDocument;

    @Prop({ type: mongoose.Schema.Types.ObjectId, required: false, ref: 'Supplier' })
    supplier: SupplierDocument;

    @Prop({ type: mongoose.Schema.Types.ObjectId, required: false, ref: 'Portal' })
    portal: PortalDocument;

    @Prop({ type: String, required: false })
    invoiceType: string;

    @Prop({
        type: String,
        required: false,
        enum: EnumInvoiceStatus,
    })
    status: string;

    @Prop({
        type: MemberType,
        required: false,
        default: undefined,
    })
    subscribers: Array<MemberType>;

    // @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'User' })
    // approvers: mongoose.Schema.Types.ObjectId[];

    @Prop({
        type: [mongoose.Schema.Types.ObjectId],
        required: false,
        ref: 'File',
        default: undefined,
    })
    files: Array<FileDocument>;

    @Prop({
        type: [mongoose.Schema.Types.ObjectId],
        required: false,
        ref: 'Email',
        default: undefined,
    })
    emails: Array<EmailDocument>;
    /** */

    @Prop({ type: String, required: false })
    clientFullName_C: string;
    @Prop({ type: String, required: false })
    clientAddress_C: string;
    @Prop({ type: String, required: false })
    clientTaxId_C: string;
    @Prop({ type: String, required: false })
    supplierFullName_C: string;
    @Prop({ type: String, required: false })
    supplierAddress_C: string;
    @Prop({ type: String, required: false })
    supplierTaxId_C: string;
    @Prop({ type: String, required: false })
    supplierIban_C: string;
    @Prop({ type: String, required: false })
    supplierBic_C: string;
    @Prop({ type: String, required: false })
    supplierSwift_C: string;
    @Prop({ type: String, required: false })
    invoiceNumber_C: string;
    @Prop({ type: String, required: false })
    poNumber_C: string;
    @Prop({ type: String, required: false })
    creditNoteId_C: string;
    @Prop({ type: Date, required: false })
    deliveryDate_D: Date;
    @Prop({ type: Date, required: false })
    issueDate_D: Date;
    @Prop({ type: Date, required: false })
    dueDate_D: Date;
    @Prop({ type: Number, required: false })
    totalAmountWithoutVat_N: number;
    @Prop({ type: Number, required: false })
    totalVatAmount_N: number;
    @Prop({ type: Number, required: false })
    totalAmountWithVat_N: number;
    @Prop({ type: String, required: false })
    currency_C: string;
    @Prop({ type: String, required: false })
    reference_C: string;
    @Prop({ type: String, required: false })
    refInvoice_C: string;
}

export type InvoiceDocument = Invoice & Document;

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);

// InvoiceSchema.index({ team: 1, status: 1 }, { sparse: true });
InvoiceSchema.index({ team: 1, supplier: 1, status: 1 }, { sparse: true });
