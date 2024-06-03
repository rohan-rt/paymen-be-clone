import { Injectable, HttpStatus, HttpException, Options, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
const mongoose = require('mongoose');

// Import configs
import config from 'config';

// Import templates
import * as InvoiceTemplates from './templates/invoice-templates.json';

// Import inputs
import { PortalInput } from './inputs/portal.input';
import { InvoiceTypeInput } from './inputs/invoice-type.input';
import { MailboxInput } from 'api/mailboxes/inputs/mailbox.input';

// Import schemas
import { EnumPortalStatus, PortalDocument } from 'api/portals/schemas/portal.schema';
import { TeamDocument } from 'api/teams/schemas/team.schema';

// Import models
import { FeedUpdatesType } from 'api/feeds/models/feed-updates.model';
import { PortalMailboxType } from './models/portal-mailbox.model';

// Import services
import { MailboxesService } from 'api/mailboxes/mailboxes.service';
import { FeedsService } from 'api/feeds/feeds.service';

// Import helpers
import { generateName } from './helpers/portal.helpers';
import { arrayCompare, fullTrim } from 'helpers/formatters.helper';
import { EnumFeedSubType, EnumFeedType } from 'api/feeds/schemas/feed.schema';
import {
    DeletedPortalContext,
    GeneralContext,
    InvoiceTypeContext,
} from 'api/feeds/models/contexts.model';

@Injectable()
export class PortalsService {
    constructor(
        @InjectModel('Portal') private readonly portalModel: Model<PortalDocument>,
        @InjectModel('Team') private readonly teamModel: Model<TeamDocument>,
        private readonly mailboxesService: MailboxesService,
        // private readonly feedsService: FeedsService,
        @Inject(forwardRef(() => FeedsService)) private readonly feedsService: FeedsService,
    ) {}

    async watch() {
        this.portalModel.watch().on('change', (data) => console.log(data));
    }

    async getAllInvoiceTemplates() {
        return InvoiceTemplates;
    }

    async getInvoiceTemplateById(templateId: string): Promise<any> {
        try {
            return InvoiceTemplates.find((t) => t._id === templateId);
        } catch (err) {
            throw err;
        }
    }

    async getPortalsByTeam(teamId: string): Promise<PortalDocument[]> {
        // === fetching portals of a given team
        const tid = mongoose.Types.ObjectId(teamId);
        const res = await this.portalModel
            .find({
                $and: [{ team: tid }, { status: { $ne: EnumPortalStatus.DELETED } }],
            })
            .populate([
                // 'team',
                'createdBy',
                'updatedBy',

                { path: 'invoiceTypes.mailbox', model: 'Mailbox' },
                { path: 'invoiceTypes.createdBy', model: 'User' },
                { path: 'invoiceTypes.updatedBy', model: 'User' },
                { path: 'subscribers.user', model: 'User' },
            ]);

        res.forEach((doc) => {
            doc.invoiceTypes = doc.invoiceTypes.filter(
                (it) => it.status !== EnumPortalStatus.DELETED,
            );
        });

        return res;
    }

    async getPortal(portalId: string, mode?: number): Promise<PortalDocument> {
        let p: any = {};
        switch (mode) {
            case 1:
                p = await this.portalModel.findOne({ _id: portalId });
                break;
            case 2:
                p = await this.portalModel.findOne({ _id: portalId }).populate({
                    path: 'invoiceTypes.mailbox',
                    model: 'Mailbox',
                });
                break;
            case 3:
                p = await this.portalModel.findOne({ _id: portalId }).populate({
                    path: 'subscribers.user',
                    model: 'User',
                });
                break;
            default:
                p = await this.portalModel.findOne({ _id: portalId }).populate([
                    // 'team',
                    'createdBy',
                    'updatedBy',
                    { path: 'invoiceTypes.mailbox', model: 'Mailbox' },
                    { path: 'invoiceTypes.createdBy', model: 'User' },
                    { path: 'invoiceTypes.updatedBy', model: 'User' },
                    { path: 'subscribers.user', model: 'User' },
                ]);
                break;
        }
        return p;
    }

    async getPortalByInvoiceType(invoiceTypeId: string, mode?: number): Promise<PortalDocument> {
        let p: any = {};
        switch (mode) {
            case 1:
                p = await this.portalModel.findOne({ 'invoiceTypes.$[elem].id': invoiceTypeId });
                break;
            case 2:
                p = await this.portalModel
                    .findOne({ 'invoiceTypes.$[elem].id': invoiceTypeId })
                    .populate({
                        path: 'invoiceTypes.mailbox',
                        model: 'Mailbox',
                    });
                break;
            default:
                p = await this.portalModel
                    .findOne({ 'invoiceTypes.$[elem].id': invoiceTypeId })
                    .populate([
                        // 'team',
                        'createdBy',
                        'updatedBy',
                        { path: 'invoiceTypes.mailbox', model: 'Mailbox' },
                        { path: 'invoiceTypes.createdBy', model: 'User' },
                        { path: 'invoiceTypes.updatedBy', model: 'User' },
                        { path: 'subscribers.user', model: 'User' },
                    ]);
                break;
        }
        return p;
    }

    async getPortalByMailbox(mailboxId: string, mode?: number): Promise<PortalDocument> {
        let p: any = {};
        const mid = mongoose.Types.ObjectId(mailboxId);
        switch (mode) {
            case 1:
                p = await this.portalModel.findOne({ 'invoiceTypes.mailbox': mid });
                break;
            case 2:
                p = await this.portalModel.findOne({ 'invoiceTypes.mailbox': mid }).populate({
                    path: 'invoiceTypes.mailbox',
                    model: 'Mailbox',
                });
                break;
            case 3:
                p = await this.portalModel.findOne({ 'invoiceTypes.mailbox': mid });
                // .populate('team');
                break;
            default:
                p = await this.portalModel.findOne({ 'invoiceTypes.mailbox': mid }).populate([
                    // 'team',
                    'createdBy',
                    'updatedBy',
                    { path: 'invoiceTypes.mailbox', model: 'Mailbox' },
                    { path: 'invoiceTypes.createdBy', model: 'User' },
                    { path: 'invoiceTypes.updatedBy', model: 'User' },
                    { path: 'subscribers.user', model: 'User' },
                ]);
                break;
        }
        return p;
    }

    async getPortalByEmail(email: string, mode?: number): Promise<PortalMailboxType> {
        if (!email) throw 'GET_PORTAL_BY_EMAIL.NO_EMAIL_PROVIDED';
        const mailbox = await this.mailboxesService.getMailboxByEmail(email);
        const portal = mailbox ? await this.getPortalByMailbox(mailbox._id, mode) : null;
        return { mailbox, portal };
    }

    async createPortal(newPortal: PortalInput): Promise<PortalDocument[]> {
        try {
            const now = new Date();

            const portal = new this.portalModel(newPortal);
            const by = mongoose.Types.ObjectId(newPortal.createdBy);

            delete newPortal._id;
            portal.status = EnumPortalStatus.ACTIVE;
            portal.createdAt = now;
            portal.updatedAt = now;
            portal.updatedBy = by;
            let portalCreated: any = 0;

            // We need to check if the prefix of the portal exist already, before we can proceed
            // If the prefix exist already, we need to regenerate the name again until it works
            // 1 - Find the latest Portal Prefix
            const env = config?.keys?.ENV?.toLowerCase();
            const latestPortal = await this.portalModel.findOne().sort({ createdAt: -1 });
            do {
                // 2 - generate new prefix name
                if (latestPortal?.prefix) {
                    let pre = latestPortal.prefix.replace(env.concat('.'), '').replace('_', '');
                    portal.prefix = generateName(pre);
                    pre = portal.prefix.replace(env.concat('.'), '').replace('_', '');
                } else portal.prefix = generateName('000');
                if (env?.length) {
                    portal.prefix = env + '.' + portal.prefix;
                }
                // 3 - try to save it and retry from step 2 if prefix already added
                try {
                    const p = await portal.save();
                    portalCreated = true;
                    newPortal.updatedAt = now;
                    newPortal.updatedBy = newPortal.createdBy;
                    newPortal._id = p._id;

                    // Create feed item in portal feed
                    await this.feedsService.createFeed({
                        portal: p._id,
                        type: EnumFeedType.PORTAL,
                        subType: EnumFeedSubType.PORTAL_CREATED,
                        userId: by,
                        team: newPortal.team,
                        context: new GeneralContext(null, newPortal.name),
                    });
                } catch (err) {
                    portalCreated += 1;
                    if (portalCreated > config.constants.PORTALS.ATTEMPT_LIMIT)
                        throw 'CREATE_PORTAL.ATTEMPT_LIMIT_EXCEEDED';
                }
            } while (portalCreated !== true);

            return await this.addNewInvoiceType(newPortal);
        } catch (err) {
            throw err;
        }
    }

    async addNewInvoiceType(portal: PortalInput): Promise<PortalDocument[]> {
        const teamId = mongoose.Types.ObjectId(portal.team);
        if (!portal.updatedAt) portal.updatedAt = new Date();
        const by = mongoose.Types.ObjectId(portal.updatedBy);

        const invType = {
            id: String(mongoose.Types.ObjectId()), // assign a new ID
            name: InvoiceTemplates[0].name,
            template: InvoiceTemplates[0].name,
            status: EnumPortalStatus.ACTIVE,
            createdAt: portal.updatedAt,
            createdBy: by,
            updatedAt: portal.updatedAt,
            updatedBy: by,
        };
        const mailbox = {
            invoiceType: invType.id,
        };
        const filteredPortal = await this.addInvoiceTypeToPortal(portal._id, invType, mailbox);
        const invTypeName = filteredPortal.invoiceTypes.find((it) => it.id === invType.id).name;
        // Create feed item in portal feed

        await this.feedsService.createFeed({
            portal: portal._id,
            type: EnumFeedType.PORTAL,
            subType: EnumFeedSubType.INVOICE_TYPE_ADDED,
            context: new InvoiceTypeContext(invType.id, invTypeName, [
                { field: 'invoiceTypes', prevValue: '', newValue: invTypeName },
            ]),
            userId: by,
            team: teamId,
        });
        return await this.getPortalsByTeam(teamId);
    }

    async addInvoiceTypeToPortal(
        portalId: string,
        invoiceType: InvoiceTypeInput,
        mailbox: MailboxInput,
    ): Promise<PortalDocument> {
        try {
            const pid = mongoose.Types.ObjectId(portalId);
            const p = await this.getPortal(pid, 1);
            const count = p.invoiceTypes?.length;

            if (count >= config.constants.INVTYPES.LIMIT) throw 'ADD_INVOICETYPE.MAX_LIMIT_REACHED';

            let mailName = count ? count + 1 : 1;
            let newName = null;
            // Add a count at the end to differentiate in name
            // Take the first available unique name
            if (count) {
                for (let i = count + 1; i < 500; i++) {
                    newName = invoiceType.name + ' ' + i;
                    invoiceType.name = newName;
                    const k = p.invoiceTypes.filter((f) => fullTrim(f.name) === fullTrim(newName));
                    if (!k.length) break;
                }
            }

            const mb = await this.mailboxesService.createMailbox(
                mailbox,
                p.prefix + '_' + mailName,
            );

            invoiceType.mailbox = mongoose.Types.ObjectId(mb._id);
            const res = await this.portalModel.findOneAndUpdate(
                { _id: portalId },
                {
                    $push: { invoiceTypes: invoiceType },
                    updatedAt: invoiceType.updatedAt,
                    updatedBy: mongoose.Types.ObjectId(invoiceType.updatedBy),
                },
                { new: true },
            );
            return res;
        } catch (err) {
            throw err;
        }
    }

    async updatePortal(portal: PortalInput): Promise<PortalDocument[]> {
        try {
            const oldPortal = await this.portalModel.findOne({ _id: portal._id });
            const context = await this.comparePortals(oldPortal, portal);
            const isFeedInvoiceType = context.updates.some((f) => f.parentField === 'invoiceTypes');
            const isDeletedIT =
                isFeedInvoiceType &&
                context.updates.some((f) => f.newValue === EnumPortalStatus.DELETED);
            const newPortal = new this.portalModel(portal);
            newPortal?.invoiceTypes?.forEach((i) => {
                i.mailbox = mongoose.Types.ObjectId(i.mailbox._id);
                i.createdBy = mongoose.Types.ObjectId(i.createdBy);
                i.updatedBy = mongoose.Types.ObjectId(i.updatedBy);
            });

            if (!newPortal.updatedAt) newPortal.updatedAt = new Date();

            const res = await this.portalModel.findOneAndUpdate(
                { _id: newPortal._id },
                { $set: newPortal },
                { new: true },
            );
            console.log(
                '🚀 ~ file: portals.service.ts:342 ~ PortalsService ~ updatePortal ~ res:',
                res,
            );

            await this.feedsService.createFeed({
                portal: newPortal._id,
                type: EnumFeedType.PORTAL,
                subType: isFeedInvoiceType
                    ? isDeletedIT
                        ? EnumFeedSubType.INVOICE_TYPE_DELETED
                        : EnumFeedSubType.INVOICE_TYPE_UPDATED
                    : EnumFeedSubType.PORTAL_UPDATED,
                userId: portal.updatedBy,
                team: portal.team,
                context: new InvoiceTypeContext(context.refId, context.name, context.updates),
            });
            return await this.getPortalsByTeam(res.team._id);
        } catch (err) {
            console.log(
                '🚀 ~ file: portals.service.ts:354 ~ PortalsService ~ updatePortal ~ err:',
                err,
            );
            throw err;
        }
    }

    async comparePortals(oldPortal, newPortal) {
        const mailboxes = newPortal?.invoiceTypes?.map((i) => i.mailbox);
        let updates: any = [{ prevValue: '', newValue: '', prevArray: [], newArray: [] }];
        let name = null;
        let refId = null;
        let mailboxUpdates = [];

        // 1 -- Update mailboxes
        if (mailboxes?.length) {
            // Update MongoDB
            mailboxUpdates = await this.mailboxesService.updateMailBoxes(mailboxes);
            if (mailboxUpdates.length === 1) mailboxUpdates.shift();
        }

        Object.keys(newPortal).map((pk) => {
            const oldPortalField = mongoose.Types.ObjectId.isValid(oldPortal[pk])
                ? oldPortal[pk].toString()
                : oldPortal[pk];

            if (pk === 'invoiceTypes') {
                newPortal[pk].map((it, index) => {
                    Object.keys(it).map((itk) => {
                        if (
                            itk !== 'createdBy' &&
                            itk !== 'createdAt' &&
                            itk !== 'updatedBy' &&
                            itk !== 'updatedAt'
                        ) {
                            if (
                                itk !== 'mailbox' &&
                                oldPortalField[index][itk] !== newPortal[pk][index][itk] &&
                                (typeof newPortal[pk][index][itk] === 'string' ||
                                    (Array.isArray(newPortal[pk][index][itk]) &&
                                        !arrayCompare(
                                            newPortal[pk][index][itk],
                                            oldPortalField[index][itk],
                                        )))
                            ) {
                                if (itk === 'mandatoryFields') {
                                    updates.push({
                                        field: itk,
                                        parentField: pk,
                                        prevArray: oldPortalField[index][itk],
                                        newArray: newPortal[pk][index][itk],
                                    });
                                } else {
                                    updates.push({
                                        field: itk,
                                        parentField: pk,
                                        prevValue: oldPortalField[index][itk],
                                        newValue: newPortal[pk][index][itk],
                                    });
                                }
                            }
                        }
                    });
                    if (!updates.filter((f) => f.field === 'name').length) {
                        name = it.name;
                        refId = it.id;
                    }
                });
            } else if (newPortal[pk] !== oldPortalField && typeof newPortal[pk] === 'string') {
                if (
                    pk !== 'createdBy' &&
                    pk !== 'createdAt' &&
                    pk !== 'updatedBy' &&
                    pk !== 'updatedAt'
                ) {
                    updates.push({
                        field: pk,
                        prevValue: oldPortalField,
                        newValue: newPortal[pk],
                    });
                }
            }
        });

        if (mailboxUpdates.length) {
            mailboxUpdates.shift();
            updates.push(...mailboxUpdates);
        }
        if (updates.length > 1) updates.shift();

        return { refId, name, updates };
    }

    async deletePortal(portal: PortalInput): Promise<PortalDocument[]> {
        try {
            // Convert team, portal ID, and updatedBy to MongoDB ObjectId
            const tid = mongoose.Types.ObjectId(portal.team);
            const pid = mongoose.Types.ObjectId(portal._id);
            const by = mongoose.Types.ObjectId(portal.updatedBy);
            const now = new Date();

            // Retrieve the dh portal details
            const dbPortal = await this.getPortal(pid, 2);
            let invoiceTypes = [];

            // Update invoice types status and mailbox status within the portal
            invoiceTypes = dbPortal.invoiceTypes.map((i) => {
                i.status = EnumPortalStatus.DELETED; // Same statuses for Portals to be applied!
                i.updatedAt = now;
                i.updatedBy = by;
                i.mailbox.status = EnumPortalStatus.DELETED; // Same statuses for Portals to be applied!
                return i;
            });

            // Update the portal details
            portal.invoiceTypes = invoiceTypes;
            portal.status = EnumPortalStatus.DELETED;
            portal.name = dbPortal.name;

            const mailboxes = portal?.invoiceTypes?.map((i) => i.mailbox);

            if (mailboxes?.length) {
                // Update MongoDB
                await this.mailboxesService.updateMailBoxes(mailboxes);
            }

            // Perform the update operation on the portal document in MongoDB
            const res = await this.portalModel.findOneAndUpdate(
                { _id: portal._id },
                { $set: portal },
                { new: true },
            );

            // Create feed item in portal feed
            await this.feedsService.createFeed({
                portal: portal._id,
                type: EnumFeedType.PORTAL,
                subType: EnumFeedSubType.PORTAL_DELETED,
                context: new DeletedPortalContext(
                    portal.name,
                    portal.invoiceTypes.map((it) => {
                        return {
                            id: it.id,
                            name: it.name,
                        };
                    }),
                    mailboxes.map((m) => {
                        return {
                            id: m._id,
                            email: m.email,
                        };
                    }),
                ),
                userId: by,
                team: tid,
            });
            return await this.getPortalsByTeam(tid);
        } catch (err) {
            throw err;
        }
    }

    async deleteInvoiceType(portal: PortalInput, invoiceTypeId: string): Promise<PortalDocument[]> {
        try {
            const pid = mongoose.Types.ObjectId(portal._id);
            const now = new Date();
            const by = mongoose.Types.ObjectId(portal.updatedBy);
            const p = await this.getPortal(pid, 2);
            let data = [];
            let updates: [FeedUpdatesType] = [{ prevValue: '', newValue: '' }];
            data = p.invoiceTypes.map((i) => {
                if (i.id === invoiceTypeId) {
                    updates = [{ field: 'invoiceTypes', prevValue: i.name, newValue: '' }];
                    i.status = EnumPortalStatus.DELETED; // Same statuses for Portals to be applied!
                    i.updatedAt = now;
                    i.updatedBy = by;
                    i.mailbox.status = EnumPortalStatus.DELETED; // Same statuses for Portals to be applied!
                }
                return i;
            });

            // Prepare portal (input)variable for DB update

            portal.invoiceTypes = data;
            portal.status = EnumPortalStatus.ACTIVE;
            await this.updatePortal(portal);
            return await this.getPortalsByTeam(p.team._id);
        } catch (err) {
            throw err;
        }
    }

    async updatePortalSubscribers(portal: PortalInput): Promise<PortalDocument> {
        const subs = portal.subscribers.map((s) => ({ user: mongoose.Types.ObjectId(s.user) }));
        const res = await this.portalModel.findOneAndUpdate(
            {
                _id: portal._id,
            },
            {
                $set: { subscribers: subs },
            },
            { new: true },
        );

        return await this.getPortal(portal._id);
    }
}
