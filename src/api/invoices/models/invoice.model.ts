import { Field, Float, ID, ObjectType } from '@nestjs/graphql';
import { FileType } from '../../files/models/file.model';
import { PortalType } from '../../portals/models/portal.model';
import { TeamType } from '../../teams/models/team.model';
import { SupplierType } from '../../suppliers/models/supplier.model';
import { EmailType } from 'api/emails/model/email.model';
import { CommonType } from 'common/models/common.model';
import { UserType } from 'api/users/models/user.model';
import { MemberType } from 'api/members/models/member.model';

@ObjectType()
export class InvoiceType extends CommonType {
    @Field(() => ID, { nullable: true })
    _id?: string;
    @Field(() => SupplierType, { nullable: true })
    supplier?: SupplierType;
    @Field(() => TeamType, { nullable: true })
    team?: TeamType;
    @Field(() => PortalType, { nullable: true })
    portal?: PortalType;
    @Field({ nullable: true })
    invoiceType?: String;
    @Field({ nullable: true })
    status?: String;

    @Field(() => [FileType], { nullable: true })
    files?: FileType[];
    @Field(() => [EmailType], { nullable: true })
    emails?: EmailType[];
    @Field(() => [MemberType], { nullable: true })
    subscribers?: Array<MemberType>;

    // @Field(() => [UserType], { nullable: true })
    // approvers?: UserType[];

    @Field({ nullable: true })
    clientFullName_C?: String;
    @Field({ nullable: true })
    clientAddress_C?: String;
    @Field({ nullable: true })
    clientTaxId_C?: String;
    @Field({ nullable: true })
    supplierFullName_C?: String;
    @Field({ nullable: true })
    supplierAddress_C?: String;
    @Field({ nullable: true })
    supplierTaxId_C?: String;
    @Field({ nullable: true })
    supplierIban_C?: String;
    @Field({ nullable: true })
    supplierBic_C?: String;
    @Field({ nullable: true })
    supplierSwift_C?: String;
    @Field({ nullable: true })
    invoiceNumber_C?: String;
    @Field({ nullable: true })
    creditNoteId_C?: String;
    @Field({ nullable: true })
    poNumber_C?: String;
    @Field({ nullable: true })
    deliveryDate_D?: Date;
    @Field({ nullable: true })
    issueDate_D?: Date;
    @Field({ nullable: true })
    dueDate_D?: Date;
    @Field(() => Float, { nullable: true })
    totalAmountWithoutVat_N?: Number;
    @Field(() => Float, { nullable: true })
    totalVatAmount_N?: Number;
    // @Field(() => Float, { nullable: true })
    // vatPercentage_N?: Number;
    @Field(() => Float, { nullable: true })
    totalAmountWithVat_N?: Number;
    @Field({ nullable: true })
    currency_C?: String;
    @Field({ nullable: true })
    reference_C?: String;
    @Field({ nullable: true })
    refInvoice_C?: String;
}
