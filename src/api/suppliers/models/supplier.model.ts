import { Field, ID, ObjectType } from '@nestjs/graphql';

// Import models
import { TeamType } from 'api/teams/models/team.model';
import { SupplierInvitationType } from 'api/supplier-invitations/models/supplier-invitation.model';
import { SupplierSettingsType } from './supplier-settings.model';
import { SupplierPropertiesType } from './supplier-properties.model';
import { InvoicesSummaryType } from 'api/invoices/models/invoices-summary.model';
import { UserType } from 'api/users/models/user.model';
import { MemberType } from 'api/members/models/member.model';

@ObjectType()
export class SupplierMetricsType {
    @Field(() => InvoicesSummaryType, { nullable: true })
    in?: InvoicesSummaryType;

    @Field(() => InvoicesSummaryType, { nullable: true })
    out?: InvoicesSummaryType;
}

@ObjectType()
// TeamType already extends CommonType
export class SupplierType extends TeamType {
    @Field({ nullable: true })
    totalInvoices?: number;

    @Field(() => TeamType, { nullable: true })
    team?: TeamType;

    @Field(() => TeamType, { nullable: true })
    supplier?: TeamType;

    @Field(() => SupplierInvitationType, { nullable: true })
    invitation?: SupplierInvitationType;

    @Field(() => [SupplierSettingsType], { nullable: true })
    settings?: Array<SupplierSettingsType>;

    @Field(() => [SupplierPropertiesType], { nullable: true })
    properties?: Array<SupplierPropertiesType>;

    @Field(() => SupplierMetricsType, { nullable: true })
    metrics?: SupplierMetricsType;

    @Field(() => [MemberType], { nullable: true })
    subscribers?: Array<MemberType>;
}
