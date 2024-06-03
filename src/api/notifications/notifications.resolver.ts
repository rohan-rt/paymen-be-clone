import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SessionAuthGuard } from 'common/guards/session.guard';
import { JwtAuthGuard } from 'common/guards/jwt.guard';

// Import services
import { NotificationsService } from './notifications.service';

// Import models
import { NotificationType } from './models/notification.model';

@Resolver()
export class NotificationsResolver {
    constructor(private notificationsService: NotificationsService) {}

    @Query((returns) => NotificationType)
    @UseGuards(JwtAuthGuard)
    async getNotificationById(@Args({ name: 'notificationId' }) notificationId: string) {
        return await this.notificationsService.getNotificationById(notificationId);
    }

    @Query((returns) => [NotificationType])
    @UseGuards(JwtAuthGuard)
    async getUserNotifications(@Args({ name: 'userId' }) userId: string) {
        return await this.notificationsService.getUserNotifications(userId);
    }

    // These don't include 'unseen' notifications
    @Query((returns) => [NotificationType])
    @UseGuards(JwtAuthGuard)
    async getMoreUserNotifications(
        @Args({ name: 'userId' }) userId: string,
        @Args('notificationId', { nullable: true }) notificationId?: string,
    ) {
        return await this.notificationsService.getNotificationsByUser(userId, true, notificationId);
    }

    @Mutation((returns) => [NotificationType])
    @UseGuards(JwtAuthGuard)
    async updateAllNotificationsToSeen(@Args({ name: 'userId' }) userId: string) {
        await this.notificationsService.updateAllNotificationsToSeenByUser(userId);
        return await this.notificationsService.getUserNotifications(userId);
    }

    @Mutation((returns) => [NotificationType])
    @UseGuards(JwtAuthGuard)
    async updateNotificationsSeen(
        @Args({ name: 'userId' }) userId: string,
        @Args({ name: 'notificationIds', type: () => [String] }) notificationIds: [string],
        @Args({ name: 'seen' }) seen: boolean,
    ) {
        await this.notificationsService.updateNotificationsSeen(notificationIds, seen, userId);
        return await this.notificationsService.getUserNotifications(userId);
    }
}
