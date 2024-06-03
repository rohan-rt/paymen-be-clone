import { Field, ID, ObjectType } from '@nestjs/graphql';
import { CAtType } from 'common/models/common-at.model';

@ObjectType()
export class MailboxType extends CAtType {
    @Field(() => ID, { nullable: true })
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
