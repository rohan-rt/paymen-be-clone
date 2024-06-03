import { Field, ObjectType } from '@nestjs/graphql';

// Import models
import { PortalType } from './portal.model';
import { MailboxType } from 'api/mailboxes/models/mailbox.model';

@ObjectType()
export class PortalMailboxType {
    @Field(() => PortalType, { nullable: true })
    portal?: PortalType;

    @Field(() => MailboxType, { nullable: true })
    mailbox?: MailboxType;
}
