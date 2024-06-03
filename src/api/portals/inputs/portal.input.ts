import { Field, InputType } from '@nestjs/graphql';
import { UserInput } from 'api/users/inputs/user.input';
import { CommonInput } from 'common/inputs/common.input';
import { InvoiceTypeInput } from './invoice-type.input';
import { MemberInput } from 'api/members/inputs/member.input';

@InputType()
export class PortalInput extends CommonInput {
    @Field({ nullable: true })
    _id?: string;
    @Field({ nullable: true })
    name?: string;
    @Field({ nullable: true })
    team?: string;
    @Field({ nullable: true })
    status?: string; // 'ACTIVE', 'DISABLED' or 'DELETED' same as portal statuses!
    @Field(() => [InvoiceTypeInput], { nullable: true })
    invoiceTypes?: Array<InvoiceTypeInput>;
    @Field(() => [MemberInput], { nullable: true })
    subscribers?: Array<MemberInput>;
}
