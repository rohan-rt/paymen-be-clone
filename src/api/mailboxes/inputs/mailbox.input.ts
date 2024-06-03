import { Field, InputType } from '@nestjs/graphql';
import { CommonInput } from 'common/inputs/common.input';
@InputType()
export class MailboxInput extends CommonInput {
    @Field({ nullable: true })
    _id?: string;

    @Field({ nullable: true })
    invoiceType?: string;

    @Field({ nullable: true })
    email?: string;

    @Field({ nullable: true })
    status?: string;

    // @Field({ nullable: true })
    // secondaryAddress?: string;
}
