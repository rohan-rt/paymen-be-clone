import { Field, Float, InputType, Int } from '@nestjs/graphql';

// Import inputs
import { CommonInput } from 'common/inputs/common.input';
import { InvoiceFileInput } from './invoice-file.input';
import { InvoicePrimaryInput } from './invoice-primary.input';
import { MemberInput } from 'api/members/inputs/member.input';

@InputType()
export class InvoiceInput extends CommonInput {
    @Field({ nullable: true })
    _id?: string;
    @Field({ nullable: true })
    supplier?: string;
    @Field({ nullable: true })
    team?: string;
    @Field({ nullable: true })
    portal?: string;
    @Field({ nullable: true })
    invoiceType?: string;
    @Field(() => [MemberInput], { nullable: true })
    subscribers?: Array<MemberInput>;

    // Only to be used for initial submission of invoice
    @Field((type) => InvoiceFileInput, { nullable: true })
    file?: InvoiceFileInput;
    @Field(() => [String], { nullable: true })
    emails?: Array<string>;

    @Field({ nullable: true })
    clientFullName_C: string;
    @Field({ nullable: true })
    clientAddress_C?: string;
    @Field({ nullable: true })
    clientTaxId_C?: string;
    @Field({ nullable: true })
    supplierFullName_C?: string;
    @Field({ nullable: true })
    supplierAddress_C?: string;
    @Field({ nullable: true })
    supplierTaxId_C?: string;
    @Field({ nullable: true })
    supplierIban_C?: string;
    @Field({ nullable: true })
    supplierBic_C?: string;
    @Field({ nullable: true })
    supplierSwift_C?: string;
    @Field({ nullable: true })
    invoiceNumber_C?: string;
    @Field({ nullable: true })
    creditNoteId_C: string;
    @Field({ nullable: true })
    poNumber_C: string;
    @Field({ nullable: true })
    deliveryDate_D?: Date;
    @Field({ nullable: true })
    issueDate_D?: Date;
    @Field({ nullable: true })
    dueDate_D?: Date;
    @Field(() => Float, { nullable: true })
    totalAmountWithoutVat_N?: number;
    @Field(() => Float, { nullable: true })
    totalVatAmount_N?: number;
    // @Field(() => Float, { nullable: true })
    // vatPercentage_N?: number;
    @Field(() => Float, { nullable: true })
    totalAmountWithVat_N?: number;
    @Field({ nullable: true })
    currency_C?: string;
    @Field({ nullable: true })
    reference_C?: string;
    @Field({ nullable: true }) // For Credit note mainly
    refInvoice_C?: string;

    // To contain old and new primary ids of either file, email or email attachment
    @Field(() => InvoicePrimaryInput, { nullable: true })
    primaryOld?: InvoicePrimaryInput;
    @Field(() => InvoicePrimaryInput, { nullable: true })
    primaryNew?: InvoicePrimaryInput;
}
