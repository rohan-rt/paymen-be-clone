import { Field, ObjectType } from '@nestjs/graphql';
import { MailboxType } from 'api/mailboxes/models/mailbox.model';
import { CommonType } from 'common/models/common.model';

@ObjectType()
export class InvoiceTypeType extends CommonType {
    @Field({ nullable: true })
    id?: string; // this is not an objectId! Purely a string

    @Field({ nullable: true })
    name?: string;

    @Field({ nullable: true })
    template?: string;

    @Field(() => [String], { nullable: true })
    mandatoryFields?: Array<string>;

    // Can be either 'ACTIVE', 'DISABLED' or 'DELETED'
    @Field({ nullable: true })
    status?: string;

    @Field(() => MailboxType, { nullable: true })
    mailbox?: MailboxType;
}
