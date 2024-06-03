import { Field, ID, ObjectType } from '@nestjs/graphql';

// Import models
// import { CAtType } from 'common/models/common.model';
import { UserType } from 'api/users/models/user.model';
import { TeamType } from 'api/teams/models/team.model';
import { PortalType } from 'api/portals/models/portal.model';
import { SupplierType } from 'api/suppliers/models/supplier.model';
import { NotifiedUsersType } from './notified-users.model';
import { CCreatedType } from 'common/models/common-created.model';
import { EmailType } from 'api/emails/model/email.model';
import { InvoiceType } from 'api/invoices/models/invoice.model';
import { FeedType } from 'api/feeds/models/feed.model';

@ObjectType()
export class NotificationType extends CCreatedType {
    @Field(() => ID, { nullable: true })
    _id?: string;

    @Field({ nullable: true })
    type?: string;

    @Field({ nullable: true })
    status?: string;

    @Field(() => UserType, { nullable: true })
    invitee?: UserType;

    // Is invitor in invite scenario
    @Field(() => [NotifiedUsersType], { nullable: true })
    users?: Array<NotifiedUsersType>;

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

    // Team with which supplier accepted the invite
    @Field(() => TeamType, { nullable: true })
    supplierTeam?: TeamType;

    @Field(() => FeedType, { nullable: true })
    feed?: FeedType;
}
