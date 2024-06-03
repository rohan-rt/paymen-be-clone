import { InjectModel } from '@nestjs/mongoose';
import { Injectable, HttpStatus, HttpException, Options, forwardRef, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
const mongoose = require('mongoose');

// Import inputs
import { FeedInput } from './inputs/feed.input';

//Import schemas
import { EnumFeedSubType, EnumFeedType, Feed, FeedDocument } from './schemas/feed.schema';

// Import configs
import config from 'config';
import { NotificationsService } from 'api/notifications/notifications.service';
import { EnumNotifType } from 'api/notifications/schemas/notification.schema';
import { SocketIoClientService } from 'api/socket-client/socket-io-client.service';

// Import lodash
import * as pick from 'lodash/pick';
import { MembersService } from 'api/members/members.service';
import { UserDocument } from 'api/users/schemas/user.schema';
import { PortalsService } from 'api/portals/portals.service';
import { PortalDocument } from 'api/portals/schemas/portal.schema';
import { SuppliersService } from 'api/suppliers/suppliers.service';

const userPopulate = [
    'createdBy',
    'updatedBy',
    'mentions',
    'portal',
    {
        path: 'portal',
        populate: {
            path: 'subscribers.user',
            model: 'User',
        },
    },
    'invoice',
    {
        path: 'invoice',
        populate: [{ path: 'subscribers.user', model: 'User' }],
    },
    'supplier',
    {
        path: 'supplier',
        populate: {
            path: 'subscribers.user',
            model: 'User',
        },
    },
    'email',
    {
        path: 'replies',
        populate: [
            { path: 'createdBy', model: 'User' },
            { path: 'mentions', model: 'User' },
        ],
    },
];

const type = {
    DELETED: 'DELETED',
    UPDATED: 'UPDATED',
    CREATED: 'CREATED',
    CREATED_R: 'CREATED_R',
    DELETED_R: 'DELETED_R',
    UPDATED_R: 'UPDATED_R',
};

@Injectable()
export class FeedsService {
    constructor(
        @InjectModel('Feed') private readonly feedModel: Model<FeedDocument>,
        @InjectModel('Portal') private readonly portalModel: Model<PortalDocument>,
        private readonly notificationsService: NotificationsService,
        private readonly socketIoClientService: SocketIoClientService,
        private readonly portalsService: PortalsService,

        @Inject(forwardRef(() => SuppliersService))
        private readonly suppliersService: SuppliersService,
    ) {}

    async getFeeds(fpi: FeedInput, all?: Boolean): Promise<FeedDocument[]> {
        let populate = [];
        // Helper function to map fpi.type to the find filter.
        const getFindFilter = (type: any) => {
            populate = userPopulate;
            switch (type) {
                case EnumFeedType.PORTAL:
                    return { team: fpi.team, portal: mongoose.Types.ObjectId(fpi.portal) };
                case EnumFeedType.SUPPLIER:
                    return { team: fpi.team, supplier: mongoose.Types.ObjectId(fpi.supplier) };
                case EnumFeedType.INVOICE:
                    return { team: fpi.team, invoice: mongoose.Types.ObjectId(fpi.invoice) };
                case EnumFeedType.EMAIL:
                    return { team: fpi.team, email: mongoose.Types.ObjectId(fpi.email) };
                default:
                    return { team: fpi.team };
            }
        };

        const find = getFindFilter(fpi.type);

        // Fetching feeds based on both find and filter criteria
        const feeds = await this.feedModel
            .find({
                ...find,
            })
            .populate(populate)
            .sort({ createdAt: -1 }) // Get most recent first
            .skip(fpi.skip || 0) // Use the provided skip value or default to 0
            .limit(all ? undefined : fpi.limit)
            .exec();

        return feeds;
    }

    async getFeedById(feedId: string): Promise<FeedDocument> {
        return await this.feedModel.findOne({ _id: feedId }).populate(userPopulate).exec();
    }

    async deleteFeed(feedId: string): Promise<FeedDocument | null> {
        const res = await this.feedModel.findByIdAndDelete(mongoose.Types.ObjectId(feedId));
        this.socketIoClientService.feedHandler(res, 'DELETED');

        return res;
    }

    async editFeed(fpi: FeedInput): Promise<any> {
        const now = new Date();
        const updatedFeed = await this.feedModel
            .findOneAndUpdate(
                { _id: mongoose.Types.ObjectId(fpi._id) },
                {
                    body: fpi.body,
                    mentions: fpi.mentions,
                    edited: true,
                    updatedAt: now,
                    editedAt: now,
                },
                { new: true },
            )
            .populate(userPopulate)
            .exec();

        this.socketIoClientService.feedHandler(updatedFeed, type.UPDATED);

        return updatedFeed;
    }

    async createFeed(fpi: FeedInput): Promise<FeedDocument> {
        const teamId = mongoose.Types.ObjectId(fpi.team);
        const now = new Date();
        const newFeed = new this.feedModel({
            ...fpi,
            team: teamId,
            createdBy: fpi.userId ? mongoose.Types.ObjectId(fpi.userId) : null,
            createdAt: now,
            updatedBy: fpi.userId ? mongoose.Types.ObjectId(fpi.userId) : null,
            updatedAt: now,
        });

        const createdFeed = await newFeed.save();

        const feed = await this.feedModel
            .findOne({ _id: mongoose.Types.ObjectId(createdFeed._id) })
            .populate(userPopulate);

        this.socketIoClientService.feedHandler(feed, type.CREATED);

        const users = await this.getUsersForNotif(fpi, fpi.mentions);

        fpi._id = mongoose.Types.ObjectId(createdFeed._id);
        const mentionedUsers: any = feed.mentions;
        if (feed.mentions) {
            const mentionsArr = fpi.mentions.map((m) => ({ user: mongoose.Types.ObjectId(m) }));
            await this.portalModel.updateOne(
                { _id: mongoose.Types.ObjectId(fpi.portal) },
                { $addToSet: { subscribers: { $each: mentionsArr } } },
            );
            this.createNotification(fpi, mentionedUsers, now, EnumNotifType.MENTION);
        }
        if (users.length) this.createNotification(fpi, users, now);

        return createdFeed;
    }

    async replyComment(parent: string, fpi: FeedInput): Promise<FeedDocument | null> {
        const now = new Date();

        // Fetch the current count of replies for the feed
        const feed = await this.feedModel.findById(parent).select('replies').exec();
        if (!feed || (feed.replies && feed.replies.length >= 100)) {
            // Throw an error or return null if there are already 100 replies
            console.error('REPLY_COMMENT_MAX_REACHED');
            return null;
        }

        const _id = mongoose.Types.ObjectId();
        const newReply = {
            _id,
            body: fpi.body,
            mentions: fpi.mentions.map((m) => mongoose.Types.ObjectId(m)),
            createdBy: fpi.userId ? mongoose.Types.ObjectId(fpi.userId) : null,
            createdAt: now,
            updatedAt: now,
            edited: false,
        };

        // Update the main feed's updatedAt and push the new reply
        const feeds = await this.feedModel.findOneAndUpdate(
            { _id: parent },
            {
                $push: { replies: newReply },
                $set: { updatedAt: now },
            },
            { new: true },
        );
        const feedPopulated = await feeds.populate(userPopulate);

        this.socketIoClientService.feedHandler(feedPopulated, type.CREATED_R);

        const users = await this.getUsersForNotif(feedPopulated, fpi.mentions);

        const mentionedUsers = [];
        feedPopulated.replies.find((r) => {
            if (r._id?.equals(_id)) {
                mentionedUsers.push(...r.mentions);
                return true;
            }
        });
        fpi._id = mongoose.Types.ObjectId(parent);
        if (feedPopulated.mentions) {
            const mentionsArr = fpi.mentions.map((m) => ({ user: mongoose.Types.ObjectId(m) }));
            this.portalModel.updateOne(
                { _id: mongoose.Types.ObjectId(fpi.portal) },
                { $addToSet: { subscribers: { $each: mentionsArr } } },
            );
            this.createNotification(fpi, mentionedUsers, now, EnumNotifType.MENTION, true);
        }
        if (users.length) this.createNotification(fpi, users, now, null, true);

        return feeds;
    }

    async editReplyComment(parent: string, fpi: FeedInput) {
        return await this.feedModel
            .findOneAndUpdate(
                { '_id': parent, 'replies._id': fpi._id },
                {
                    $set: {
                        'replies.$.body': fpi.body,
                        'replies.$.mentions': fpi.mentions,
                        'replies.$.edited': true,
                        'replies.$.editedAt': new Date(),
                    },
                },
                { new: true },
            )
            .exec();
    }

    async removeReplyComment(parent: string, replyId: string) {
        return await this.feedModel
            .findByIdAndUpdate(
                parent,
                { $pull: { replies: { _id: mongoose.Types.ObjectId(replyId) } } },
                { new: true, useFindAndModify: false },
            )
            .exec();
    }

    async createNotification(
        objFeed: FeedInput,
        objUsers: UserDocument[],
        time: Date,
        type?: string,
        isReply?: boolean,
    ) {
        const userAttrs = ['_id', 'firstName', 'lastName', 'avatarBg'];
        let users = [];
        const notifUsers = objUsers.filter((user) => objFeed.userId !== user._id.toString());

        if (notifUsers.length) {
            const feed = await this.getFeedById(objFeed._id);
            const notifType =
                type ??
                (objFeed.subType === EnumFeedSubType.COMMENT
                    ? EnumFeedSubType.COMMENT
                    : this.getType(objFeed.type));

            const team = pick(feed.team, ['_id', 'name', 'logoBg']);

            users = notifUsers.map((ou) => {
                return {
                    user: pick(ou, userAttrs),
                    seen: false,
                };
            });

            const replyCount = feed.replies?.length;
            const notif = {
                type: notifType,
                team,
                users,
                feed: isReply ? feed.replies[replyCount - 1]._id : feed._id,
                createdAt: time,
                createdBy: objFeed.userId,
            };
            if (objFeed.portal) notif['portal'] = pick(feed.portal, ['_id', 'name', 'status']);
            else if (objFeed.supplier)
                notif['supplier'] = pick(feed.supplier, ['_id', 'name', 'status']);

            return await this.notificationsService.addNotification(notif);
        }
        return null;
    }

    getType(type: string) {
        switch (type) {
            case EnumFeedType.PORTAL:
                return EnumNotifType.FEED_POR;
            case EnumFeedType.SUPPLIER:
                return EnumNotifType.FEED_SUP;
            case EnumFeedType.INVOICE:
                return EnumNotifType.FEED_INV;
            default:
                return EnumNotifType.COMMENT;
        }
    }

    async getUsersForNotif(feed, mentions: Array<String>) {
        const users = [];
        let subscribers = null;
        switch (feed.type) {
            case EnumFeedType.PORTAL:
                if (feed.portal.name) {
                    subscribers = feed.portal.subscribers;
                } else {
                    const portal = await this.portalsService.getPortal(feed.portal, 3);
                    subscribers = portal.subscribers;
                }
                break;
            case EnumFeedType.SUPPLIER:
                if (feed.supplier.name) {
                    subscribers = feed.supplier.subscribers;
                } else {
                    const supplier = await this.suppliersService.getSupplierById(feed.supplier);
                    subscribers = supplier.subscribers;
                }
                break;
            default:
                break;
        }
        subscribers?.forEach((s) => {
            if (!mentions?.find((m: any) => m === s.user._id.toString())) users.push(s.user);
        });
        return users;
    }
}
