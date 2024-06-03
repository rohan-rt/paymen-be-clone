import { Field, InputType } from '@nestjs/graphql';
import { MailboxInput } from 'api/mailboxes/inputs/mailbox.input';
import { CommonInput } from 'common/inputs/common.input';

@InputType()
export class InvoiceTypeInput extends CommonInput {
    @Field({ nullable: true })
    id?: string;
    @Field({ nullable: true })
    name?: string;
    @Field({ nullable: true })
    template?: string;
    @Field(() => [String], { nullable: true })
    mandatoryFields?: Array<string>;
    @Field({ nullable: true })
    status?: string;
    @Field(() => MailboxInput, { nullable: true })
    mailbox?: MailboxInput;
}
