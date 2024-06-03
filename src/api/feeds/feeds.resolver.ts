import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { SessionAuthGuard } from 'common/guards/session.guard';
import { JwtAuthGuard } from 'common/guards/jwt.guard';

// Import Services
import { FeedsService } from './feeds.service';

//Import Inputs
import { FeedInput } from './inputs/feed.input';

// Import Models
import { FeedType } from './models/feed.model';

@Resolver()
export class FeedsResolver {
    constructor(private feedsService: FeedsService) {}

    @Query((returns) => [FeedType])
    // @UseGuards(JwtAuthGuard)
    async getFeeds(
        @Args({ name: 'feedInput' }) feedInput: FeedInput,
        @Args('type', { nullable: true }) type?: string,
        @Args('all', { nullable: true }) all?: Boolean,
    ) {
        return await this.feedsService.getFeeds(feedInput, all);
    }

    @Mutation((returns) => FeedType)
    @UseGuards(JwtAuthGuard)
    async deleteFeed(@Args({ name: 'feedId' }) feedId: string) {
        return await this.feedsService.deleteFeed(feedId);
    }

    @Mutation((returns) => FeedType)
    @UseGuards(JwtAuthGuard)
    async editFeed(@Args({ name: 'feedInput' }) feedInput: FeedInput) {
        return await this.feedsService.editFeed(feedInput);
    }

    @Mutation((returns) => FeedType)
    @UseGuards(JwtAuthGuard)
    async createFeed(@Args({ name: 'feedInput' }) feedInput: FeedInput) {
        return await this.feedsService.createFeed(feedInput);
    }

    @Mutation((returns) => FeedType)
    // @UseGuards(JwtAuthGuard)
    async replyComment(
        @Args({ name: 'feedInput' }) feedInput: FeedInput,
        @Args({ name: 'parent' }) parent: string,
    ) {
        return await this.feedsService.replyComment(parent, feedInput);
    }

    @Mutation((returns) => FeedType)
    @UseGuards(JwtAuthGuard)
    async editReplyComment(
        @Args({ name: 'feedInput' }) feedInput: FeedInput,
        @Args({ name: 'parent' }) parent: string,
    ) {
        return await this.feedsService.editReplyComment(parent, feedInput);
    }

    @Mutation((returns) => FeedType)
    @UseGuards(JwtAuthGuard)
    async removeReplyComment(
        @Args({ name: 'parent' }) parent: string,
        @Args({ name: 'replyId' }) replyId: string,
    ) {
        return await this.feedsService.removeReplyComment(parent, replyId);
    }
}
