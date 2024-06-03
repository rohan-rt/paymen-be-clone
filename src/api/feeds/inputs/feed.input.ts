import { Field, InputType } from '@nestjs/graphql';
import { InvoiceTypeInput } from 'api/portals/inputs/invoice-type.input';
import { PortalInput } from 'api/portals/inputs/portal.input';
import { InvoiceTypeType } from 'api/portals/models/invoice-type.model';
import { FeedUpdatesInput } from 'api/feeds/inputs/feed-updates.input';
import { FeedType } from '../models/feed.model';
import GraphQLJSON from 'graphql-type-json';

@InputType()
export class FeedInput {
    @Field({ nullable: true })
    _id?: string;

    @Field({ nullable: true })
    type?: string;

    @Field({ nullable: true })
    subType?: string;

    @Field((type) => GraphQLJSON, { nullable: true })
    context?: any;

    @Field({ nullable: true })
    portal?: string;

    @Field({ nullable: true })
    invoice?: string;

    @Field({ nullable: true })
    supplier?: string;

    @Field({ nullable: true })
    userId?: string;

    @Field({ nullable: true })
    team: string;

    @Field({ nullable: true })
    email?: string;

    // Comments
    @Field({ nullable: true })
    body?: string;

    @Field(() => [FeedInput], { nullable: true })
    replies?: Array<FeedInput>;

    @Field(() => [String], { nullable: true })
    mentions?: Array<String>;

    @Field({ nullable: true })
    skip?: number;
    @Field({ nullable: true })
    limit?: number;
}
