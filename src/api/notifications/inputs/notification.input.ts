import { Field, InputType } from '@nestjs/graphql';

// Import inputs
import { CAtInput } from 'common/inputs/common-at.input';

// Import types
import { UserType } from 'api/users/models/user.model';
import { TeamType } from 'api/teams/models/team.model';
import { PortalType } from 'api/portals/models/portal.model';
import { SupplierType } from 'api/suppliers/models/supplier.model';
import { NotifiedUsersType } from '../models/notified-users.model';
import { EmailType } from 'api/emails/model/email.model';
import { InvoiceType } from 'api/invoices/models/invoice.model';
import { FeedType } from 'api/feeds/models/feed.model';

@InputType()
export class NotificationInput extends CAtInput {
    @Field({ nullable: true })
    _id?: string;

    @Field({ nullable: true })
    type?: string;

    @Field({ nullable: true })
    status?: string;

    @Field({ nullable: true })
    seen?: boolean;

    @Field(() => [NotifiedUsersType], { nullable: true })
    users?: Array<NotifiedUsersType>;

    @Field(() => UserType, { nullable: true })
    invitor?: UserType;

    // @Field(() => UserType, { nullable: true })
    // invitee?: UserType;

    @Field(() => TeamType, { nullable: true })
    team?: TeamType;

    @Field(() => InvoiceType, { nullable: true })
    invoice?: InvoiceType;

    @Field(() => PortalType, { nullable: true })
    portal?: PortalType;

    @Field(() => SupplierType, { nullable: true })
    supplier?: SupplierType;

    @Field(() => EmailType, { nullable: true })
    email?: EmailType;

    @Field(() => FeedType, { nullable: true })
    feed?: FeedType;
}
