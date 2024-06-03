import { Field, ID, ObjectType } from '@nestjs/graphql';

// Import models
import { CommonType } from 'common/models/common.model';
import { TeamType } from 'api/teams/models/team.model';
import { PortalType } from 'api/portals/models/portal.model';
import { FeedUpdatesType } from 'api/feeds/models/feed-updates.model';
import { InvoiceType } from 'api/invoices/models/invoice.model';
import { SupplierType } from 'api/suppliers/models/supplier.model';
import { EmailType } from 'api/emails/model/email.model';
import { UserType } from 'api/users/models/user.model';
import { GraphQLJSONObject } from 'graphql-type-json';

@ObjectType()
export class FeedType extends CommonType {
    @Field(() => ID, { nullable: true })
    _id?: string;

    @Field({ nullable: true })
    type?: string;

    @Field({ nullable: true })
    subType?: string;

    @Field({ nullable: true })
    body?: string;

    @Field(() => [FeedType], { nullable: true })
    replies?: Array<FeedType>;

    @Field(() => InvoiceType, { nullable: true })
    invoice?: InvoiceType;

    @Field(() => SupplierType, { nullable: true })
    supplier?: SupplierType;

    @Field(() => PortalType, { nullable: true })
    portal?: PortalType;

    @Field(() => EmailType, { nullable: true })
    email?: EmailType;

    @Field(() => TeamType, { nullable: true })
    team?: TeamType;

    @Field(() => GraphQLJSONObject, { nullable: true })
    context?: any;

    @Field(() => [UserType], { nullable: true })
    mentions?: [UserType];

    @Field({ nullable: true })
    edited?: boolean;

    @Field({ nullable: true })
    editedAt?: Date;
}
