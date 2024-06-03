import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
const mongoose = require('mongoose');

// Import inputs
import { NotificationInput } from './inputs/notification.input';

// Import schemas
import { NotificationDocument } from './schemas/notification.schema';

// Import configs
import config from 'config';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectModel('Notification')
        private readonly notificationModel: Model<NotificationDocument>,
    ) {}

    async getUserNotifications(userId: string): Promise<NotificationDocument[]> {
        // 1 -- Get all unseen notifications
        const unseen = await this.getNotificationsByUser(userId);
        // 2 -- Get limited seen notifs
        const seen = await this.getNotificationsByUser(userId, true);
        const res = unseen.concat(seen);
        return res?.length ? res : [];
    }

    async getNotificationsByUser(
        userId: string,
        getSeen?: boolean,
        notifId?: string,
    ): Promise<NotificationDocument[]> {
        let notifs = [];

        // notifId passed for pagination purposes
        let id: any = null;
        if (notifId) id = { _id: { $lt: notifId } };

        notifs = await this.notificationModel
            .find({
                users: {
                    $elemMatch: {
                        'user._id': mongoose.Types.ObjectId(userId),
                        'seen': getSeen ? true : false,
                    },
                },
                ...id,
            })
            .populate('createdBy')
            .sort({ createdAt: -1 }) // Get most recent first
            .limit(getSeen ? config.constants.NOTIFS.LIMIT : null); // Don't limit whenever getting all unseen
        return notifs;
    }

    async getNotificationById(notificationId: string): Promise<NotificationDocument> {
        const notif = await this.notificationModel
            .findOne({ _id: notificationId })
            .populate('createdBy');
        return notif;
    }

    async addNotification(notification: NotificationInput): Promise<NotificationDocument> {
        try {
            const newNotif = new this.notificationModel(notification);
            if (!newNotif.createdAt) newNotif.createdAt = new Date();
            await newNotif.save();
            return await this.getNotificationById(newNotif._id);
        } catch (err) {
            throw err;
        }
    }

    async updateAllNotificationsToSeenByUser(userId: string): Promise<string> {
        try {
            const now = new Date();
            const notifs = await this.notificationModel.updateMany(
                {
                    users: {
                        $elemMatch: { 'user._id': mongoose.Types.ObjectId(userId), 'seen': false },
                    },
                },
                {
                    $set: {
                        'users.$[elem].seen': true,
                        'users.$[elem].updatedAt': now,
                    },
                },
                {
                    arrayFilters: [{ 'elem.user._id': mongoose.Types.ObjectId(userId) }],
                    multi: true,
                },
            );
            if (notifs?.modifiedCount > 0) {
                return 'NOTIFICATIONS.STATUS.UPDATED_ALL_TO_SEEN';
            } else if (notifs?.modifiedCount === 0) {
                return 'NOTIFICATIONS.STATUS.NOTHING_TO_UPDATE';
            }
        } catch (err) {
            return 'NOTIFICATIONS.STATUS.NOT_UPDATED';
        }
    }

    async updateNotificationsSeen(
        notificationIds: [string],
        seen: boolean,
        userId: string,
    ): Promise<string> {
        try {
            const now = new Date();
            const notifs = await this.notificationModel.updateMany(
                {
                    $and: [
                        { _id: { $in: notificationIds } },
                        { 'users.user._id': mongoose.Types.ObjectId(userId) },
                    ],
                },
                {
                    $set: {
                        'users.$[elem].seen': seen,
                        'users.$[elem].updatedAt': now,
                    },
                },
                {
                    arrayFilters: [{ 'elem.user._id': mongoose.Types.ObjectId(userId) }],
                    multi: true,
                },
            );
            if (notifs?.modifiedCount > 0) {
                return 'NOTIFICATIONS.STATUS.UPDATED';
            } else if (notifs?.modifiedCount == 0) {
                return 'NOTIFICATIONS.STATUS.NOTHING_TO_UPDATE';
            }
        } catch (err) {
            return 'NOTIFICATIONS.STATUS.NOT_UPDATED';
        }
    }
}
