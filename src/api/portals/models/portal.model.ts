import { Field, ID, ObjectType } from '@nestjs/graphql';

// Import models
import { TeamType } from 'api/teams/models/team.model';
import { InvoiceTypeType } from './invoice-type.model';
import { CommonType } from 'common/models/common.model';
import { MemberType } from 'api/members/models/member.model';

@ObjectType()
export class PortalType extends CommonType {
    @Field(() => ID, { nullable: true })
    _id?: string;

    @Field({ nullable: true })
    name?: string;

    @Field({ nullable: true })
    status?: string;

    @Field(() => TeamType, { nullable: true })
    team?: TeamType;

    @Field(() => [InvoiceTypeType], { nullable: true })
    invoiceTypes?: Array<InvoiceTypeType>;

    @Field(() => [MemberType], { nullable: true })
    subscribers?: Array<MemberType>;
}
