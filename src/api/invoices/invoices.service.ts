import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
const mongoose = require('mongoose');

// Import inputs
import { InvoiceInput } from './inputs/invoice.input';
import { FileInput } from '../files/inputs/files.input';
import { InvoicePrimaryInput } from './inputs/invoice-primary.input';

// Import schemas and enums
import { EnumEmailStatus } from 'api/emails/schema/email.schema';
import { InvoiceDocument, EnumInvoiceStatus } from './schemas/invoice.schema';
import { SupplierDocument } from 'api/suppliers/schemas/supplier.schema';
import { MemberDocument } from 'api/members/schemas/member.schema';
import { PortalDocument } from 'api/portals/schemas/portal.schema';
import { FileDocument } from 'api/files/schemas/file.schema';

// Import models
import { InvoicesSummaryType } from './models/invoices-summary.model';

// Import services
import { FilesService } from '../files/files.service';
import { EmailsService } from 'api/emails/emails.service';
import { FeedsService } from 'api/feeds/feeds.service';

// Import configs & helpers
import { fullTrim } from 'helpers/formatters.helper';
import { aggrInvoicesInSummary } from 'helpers/invoice-summaries.helper';
import { EnumFeedSubType, EnumFeedType } from 'api/feeds/schemas/feed.schema';
import { GeneralContext, InvoiceTypeContext } from 'api/feeds/models/contexts.model';
import { InvoiceType } from './models/invoice.model';

@Injectable()
export class InvoicesService {
    constructor(
        @InjectModel('Invoice') private invoiceModel: Model<InvoiceDocument>,
        @InjectModel('Supplier') private readonly supplierModel: Model<SupplierDocument>,
        @InjectModel('Member') private readonly memberModel: Model<MemberDocument>,
        @InjectModel('Portal') private readonly portalModel: Model<PortalDocument>,
        private readonly filesService: FilesService,
        private readonly emailsService: EmailsService,

        @Inject(forwardRef(() => FeedsService))
        private readonly feedsService: FeedsService,
    ) {}

    async getInvoiceRelatedMembers(invoiceId: string, teamId: string): Promise<any> {
        const invoice = await this.invoiceModel
            .findOne({ _id: invoiceId })
            .populate([
                'supplier',
                { path: 'supplier', populate: { path: 'supplier', model: 'Team' } },
                { path: 'subscribers', model: 'User' },
            ]);
        const subscribers = invoice.subscribers;
        const members = await this.memberModel
            .find({ team: mongoose.Types.ObjectId(teamId) })
            .populate('user');
        const item = invoice.supplier.supplier
            ? {
                  _id: invoice.supplier.supplier._id,
                  firstName: invoice.supplier.supplier.name,
                  lastName: '',
                  type: 'supplier',
              }
            : null;
        const res = item ? [item] : [];
        members.map((m) => {
            res.push({
                _id: m.user._id,
                firstName: m.user.firstName,
                lastName: m.user.lastName,
                type: 'member',
            });
        });
        subscribers?.map((pi) => {
            let obj = res.find((r) => r._id === pi._id);
            if (obj) return;
            res.push({
                _id: pi._id,
                firstName: pi.user.firstName,
                lastName: pi.user.lastName,
                type: 'member',
            });
        });
        return res;
    }
    // async findAll(): Promise<InvoiceDocument[]> {
    //     return await this.invoiceModel.find().populate(['createdBy', 'updatedBy', 'files']);
    // }

    async getInvoicesByTeam(id: string): Promise<InvoiceDocument[]> {
        const res = await this.invoiceModel.find({ team: mongoose.Types.ObjectId(id) }).populate([
            'createdBy',
            'updatedBy',
            'supplier',
            { path: 'supplier', populate: { path: 'supplier', model: 'Team' } },
            // 'team',
            'portal',
            'files',
            { path: 'files', populate: { path: 'createdBy', model: 'User' } },
            { path: 'files', populate: { path: 'updatedBy', model: 'User' } },
            'emails',
            { path: 'subscribers.user', model: 'User' },
            { path: 'subscribers.team', model: 'Team' },
            { path: 'emails', populate: { path: 'attachments', model: 'EmailAttachment' } },
            { path: 'emails', populate: { path: 'linkedBy', model: 'User' } },
        ]);
        return res;
    }

    async getInvoicesBySupplierTeam(id: string): Promise<any> {
        const suppliers = await this.supplierModel.find(
            { supplier: mongoose.Types.ObjectId(id) },
            { _id: 1 },
        );
        const supplierIds = suppliers.map((s) => s._id);
        const res = await this.invoiceModel.find({ supplier: { $in: supplierIds } }).populate([
            'createdBy',
            'updatedBy',
            'supplier',
            { path: 'supplier', populate: { path: 'supplier', model: 'Team' } },
            { path: 'subscribers.user', model: 'User' },
            { path: 'subscribers.team', model: 'Team' },
            // 'team',
            'portal',
            'emails',
        ]);
        return res;
    }

    async getInvoiceById(id: string): Promise<InvoiceDocument> {
        const res = await this.invoiceModel.findOne({ _id: id }).populate([
            'createdBy',
            'updatedBy',
            'supplier',
            { path: 'supplier', populate: { path: 'supplier', model: 'Team' } },
            // 'team',
            'portal',
            'files',
            { path: 'files', populate: { path: 'createdBy', model: 'User' } },
            { path: 'files', populate: { path: 'updatedBy', model: 'User' } },
            'emails',
            { path: 'subscribers.user', model: 'User' },
            { path: 'subscribers.team', model: 'Team' },
            { path: 'emails', populate: { path: 'attachments', model: 'EmailAttachment' } },
            { path: 'emails', populate: { path: 'linkedBy', model: 'User' } },
        ]);
        return res;
    }

    async submitInvoice(invoice: InvoiceInput): Promise<InvoiceDocument> {
        const now = new Date();
        // Remove empty variables
        for (const key in invoice) {
            if (key.endsWith('_C')) {
                invoice[key] = fullTrim(invoice[key]);
                if (!invoice[key]?.length) delete invoice[key];
            }
        }
        const inv = new this.invoiceModel(invoice);
        inv.createdAt = now;
        inv.updatedAt = now;
        inv.status = EnumInvoiceStatus.NEW;
        inv.files = []; // Needed for scenario 1 below
        // inv.emails is already provided normally, thus scenario 2 & 3 covered
        const res = await inv.save();

        const f = invoice.file;
        switch (true) {
            // Scenario 1: Adding manually uploaded file into new inv
            // InvoiceFileInput is not part of schema; so no worries here!
            case !!f?.files?.length:
                for (let i = 0; i < f.files.length; i++) {
                    const fi = f.files[i];
                    fi.isPrimary = i === 0;
                    fi.teamId = invoice.team;
                    fi.invoiceId = res._id;
                    fi.updatedAt = now;
                    const file = await this.filesService.uploadFile(fi);
                    res.files.push(file);
                }
                break;

            // Scenario 2: Accepting the body of an email into new inv
            case !!f?.email:
                // Update the actual email entry
                f.email.treated = true;
                f.email.status = EnumEmailStatus.ACCEPTED;
                f.email.body.isPrimary = true;
                f.email.updatedAt = now;
                await this.emailsService.updateEmail(f.email);
                break;

            // Scenario 3: Accepting attachment of an email into new inv
            case !!f?.emailAttachment:
                f.emailAttachment.isPrimary = true;
                f.emailAttachment.updatedAt = now;
                await this.emailsService.updateEmailAttachment(f.emailAttachment);
                break;

            default:
                throw 'SUBMIT_INVOICE.FILE_MISSING';
        }

        if (invoice?.emails?.length) {
            const emails = {
                emailIds: invoice.emails,
                status: EnumEmailStatus.ACCEPTED,
                teamId: invoice.team,
                userId: invoice.updatedBy,
                invoiceId: res._id,
                linkedAt: now,
            };
            await this.emailsService.updateEmailStatus(emails);
        }

        await this.feedsService.createFeed({
            invoice: res._id,
            type: EnumFeedType.INVOICE,
            subType: EnumFeedSubType.INVOICE_ADDED,
            userId: invoice.updatedBy,
            team: invoice._id,
            context: new GeneralContext(null, invoice.invoiceNumber_C),
        });

        return res.populate([
            'createdBy',
            'updatedBy',
            // 'team',
            'supplier',
            { path: 'supplier', populate: { path: 'supplier', model: 'Team' } },
            'portal',
            // 'files',
            // { path: 'files', populate: { path: 'createdBy', model: 'User' } },
            'emails',
            { path: 'emails', populate: { path: 'attachments', model: 'EmailAttachment' } },
        ]);
    }

    async updateStatus(id: string, status: string, userId: string): Promise<InvoiceDocument> {
        try {
            const inv = await this.invoiceModel.findOne({ _id: id });
            const res = await this.invoiceModel
                .findOneAndUpdate(
                    { _id: id },
                    {
                        $set: {
                            status,
                            updatedAt: new Date(),
                            updatedBy: mongoose.Types.ObjectId(userId),
                        },
                    },
                    { new: true },
                )
                .populate('updatedBy');

            await this.feedsService.createFeed({
                invoice: id,
                type: EnumFeedType.INVOICE,
                subType: EnumFeedSubType.INVOICE_STATUS_UPDATE,
                team: String(res.team._id),
                userId,
                context: new InvoiceTypeContext(null, null, [
                    { field: 'status', prevValue: inv.status, newValue: res.status },
                ]),
            });
            return res;
        } catch (error) {
            throw error;
        }
    }

    async handlePrimary(
        primOld: InvoicePrimaryInput,
        primNew: InvoicePrimaryInput,
        userId: string,
        teamId: string,
        invoiceId: string,
    ) {
        const allowed = [0, 1, 2];
        if (!userId) throw 'PRIMARY_INVOICE.UPDATEDBY_MISSING';
        if (!primOld._id) throw 'PRIMARY_INVOICE.OLD_ID_MISSING';
        if (!allowed.includes(primOld.type)) throw 'PRIMARY_INVOICE.OLD_TYPE_MISSING';
        if (!primNew._id) throw 'PRIMARY_INVOICE.NEW_ID_MISSING';
        if (!allowed.includes(primNew.type)) throw 'PRIMARY_INVOICE.NEW_TYPE_MISSING';

        const now = new Date();
        const old = {
            _id: primOld._id,
            isPrimary: false,
            updatedAt: now,
            updatedBy: userId,
        };
        const curr = {
            _id: primNew._id,
            isPrimary: true,
            updatedAt: now,
            updatedBy: userId,
        };
        const upd1 = await this.updatePrimary(primOld.type, old);
        const upd2 = await this.updatePrimary(primNew.type, curr);

        /** If emailAttachmemt/file is made primary then they will have number, however,
         * if email is made primary we will use its subject */
        const updates = [
            {
                field: 'primary',
                prevValue: upd1.name ?? upd1.subject,
                newValue: upd2.name ?? upd1.subject,
            },
        ];

        await this.feedsService.createFeed({
            invoice: invoiceId,
            type: EnumFeedType.INVOICE,
            subType: EnumFeedSubType.INVOICE_UPDATE_PRIMARY,
            team: teamId,
            userId,
            context: new InvoiceTypeContext(null, null, updates),
        });
    }

    async updatePrimary(type: number, input: any): Promise<any> {
        if (type === 0) {
            return await this.filesService.updateFile(input);
        } else if (type === 1) {
            // 1 -Get minimal email to fetch body
            const email = await this.emailsService.getEmailById(input._id, 1);
            const body = email.body;
            body.isPrimary = input.isPrimary;
            // 2 - Remove isPrimary from parent object first
            delete input.isPrimary;
            const data = { ...input, body };
            return await this.emailsService.updateEmail(data);
        } else if (type === 2) {
            return await this.emailsService.updateEmailAttachment(input);
        }
    }

    async updateInvoice(invoice: InvoiceInput): Promise<InvoiceDocument> {
        const now = new Date();
        const currInv = await this.invoiceModel.findOne({ _id: invoice._id }).populate('portal'); // Needed for Feed Creation !

        if (!invoice._id) throw 'UPDATE_INVOICE.NO_ID';
        if (!invoice.updatedBy) throw 'UPDATE_INVOICE.NO_UPDATEDBY';
        if (!invoice?.updatedAt) invoice.updatedAt = now;
        // InvoiceFileInput is not part of schema; so no worries here!
        const inv = new this.invoiceModel(invoice);

        // If 'invoice.file', update the corresponding file type as well
        // Mainly to update 'labels_C' with

        const f = invoice?.file;
        switch (true) {
            // Scenario 1: Update FileType
            case !!f?.file:
                f.file['updatedAt'] = now;
                await this.filesService.updateFile(f.file);
                break;

            // Scenario 2: Accepting the body of an email into new inv
            case !!f?.email:
                f.email['updatedAt'] = now;
                await this.emailsService.updateEmail(f.email);
                break;

            // Scenario 3: Accepting attachment of an email into new inv
            case !!f?.emailAttachment:
                f.emailAttachment['updatedAt'] = now;
                await this.emailsService.updateEmailAttachment(f.emailAttachment);
                break;

            default:
                break;
        }

        // Primary file switch
        if (invoice.primaryOld && invoice.primaryNew) {
            await this.handlePrimary(
                invoice.primaryOld,
                invoice.primaryNew,
                invoice.updatedBy,
                currInv.team._id,
                invoice._id,
            );
        }

        const res = await this.invoiceModel
            .findOneAndUpdate(
                {
                    _id: inv._id,
                },
                { $set: inv },
                { new: true },
            )
            .populate([
                'createdBy',
                'updatedBy',
                'supplier',
                { path: 'supplier', populate: { path: 'supplier', model: 'Team' } },
                // 'team',
                'portal',
                'files',
                { path: 'files', populate: { path: 'createdBy', model: 'User' } },
                { path: 'files', populate: { path: 'updatedBy', model: 'User' } },
                'emails',
                { path: 'emails', populate: { path: 'attachments', model: 'EmailAttachment' } },
            ]);

        // Create feed item
        const common: any = {
            invoice: String(res._id),
            userId: String(res.updatedBy._id),
            team: String(res.team._id),
            type: EnumFeedType.INVOICE,
        };

        if (!res?.portal?._id.equals(currInv?.portal._id)) {
            // Create feed item in email feed
            await this.feedsService.createFeed({
                ...common,
                subType: EnumFeedSubType.INVOICE_PORTAL_UPDATE,
                context: new InvoiceTypeContext(null, 'Portal', [
                    { field: 'portal', prevValue: currInv.portal.name, newValue: res.portal.name },
                ]),
            });
        }
        if (res?.invoiceType !== currInv?.invoiceType) {
            //   const portalData = await this.portalModel.findOne({
            //     "invoiceTypes.id": res.invoiceType,
            //   });
            const oldIT = currInv.portal.invoiceTypes.find((it) => it.id === currInv.invoiceType);
            let newIT: any = {};
            if (!res?.portal?._id.equals(currInv?.portal._id)) {
                newIT = res.portal.invoiceTypes.find((it) => it.id === res.invoiceType);
            } else newIT = currInv.portal.invoiceTypes.find((it) => it.id === res.invoiceType);
            // Create feed item in email feed
            await this.feedsService.createFeed({
                ...common,
                subType: EnumFeedSubType.INVOICE_IT_UPDATE,
                context: new InvoiceTypeContext(null, 'Invoice Type', [
                    { field: 'invoiceType', prevValue: oldIT.name, newValue: newIT.name },
                ]),
            });
        }
        if (true) {
            const updates = [];
            const oldInvKeys = Object.keys(currInv.toJSON());
            const newInvKeys = Object.keys(res.toJSON());
            const checkArr = ['_C', '_N', '_D'];
            oldInvKeys.forEach((k) => {
                if (checkArr.find((c) => k.endsWith(c)) && currInv[k] !== res[k]) {
                    if (k.endsWith('_D') && currInv[k].getTime() === res[k].getTime()) return;
                    updates.push({ field: k, prevValue: currInv[k], newValue: res[k] });
                    let index = newInvKeys.indexOf(k);
                    if (index > -1) {
                        newInvKeys.splice(index, 1);
                    }
                }
            });
            newInvKeys.forEach((k) => {
                if (checkArr.find((c) => k.endsWith(c)) && currInv[k] !== res[k]) {
                    if (k.endsWith('_D') && currInv[k].getTime() === res[k].getTime()) return;
                    updates.push({ field: k, prevValue: currInv[k], newValue: res[k] });
                }
            });
            if (updates.length)
                await this.feedsService.createFeed({
                    ...common,
                    subType: EnumFeedSubType.INVOICE_UPDATED,
                    context: new InvoiceTypeContext(null, null, updates),
                });
        }

        return res;
    }

    async uploadFiles(files: FileInput[]): Promise<FileDocument[]> {
        const invoiceId = files[0].invoiceId;
        const updates = [];
        await Promise.all(
            files.map(async (file) => {
                let uploadedFile = await this.filesService.uploadFile(file);
                updates.push({ field: 'file', prevValue: '', newValue: uploadedFile.name });
            }),
        );
        // Create feed item in invoice feed
        await this.feedsService.createFeed({
            invoice: files[0].invoiceId,
            type: EnumFeedType.INVOICE,
            subType: EnumFeedSubType.INVOICE_FILE_UPLOAD,
            team: files[0].teamId,
            userId: files[0].createdBy,
            context: new InvoiceTypeContext(null, null, updates),
        });

        return await this.filesService.getAllFilesByInvoiceId(invoiceId);
    }

    async getInvoicesByPortal(portalId: string): Promise<InvoiceDocument[]> {
        const res = await this.invoiceModel.find({ _id: portalId }).populate([
            'emails',
            // 'team',
            'files',
            'createdBy',
            'updatedBy',
            { path: 'subscribers', model: 'User' },
        ]);
        return res;
    }

    async getInvoicesByInvoiceType(invoiceTypeId: string): Promise<InvoiceDocument[]> {
        return await this.invoiceModel.find({ invoiceType: invoiceTypeId }).populate([
            // 'team',
            'portal',
            'supplier',
            { path: 'supplier', populate: { path: 'supplier', model: 'Team' } },
        ]);
    }

    async getInvoiceForEmail(emailIds: string[]): Promise<any> {
        const x = emailIds.map((e) => mongoose.Types.ObjectId(e));
        return await this.invoiceModel
            .find({ emails: { $in: x } })
            .populate(['files', 'createdBy', { path: 'subscribers', model: 'User' }]);
    }

    // async deleteById(id: string, userId: string): Promise<any> {
    //     if (!id) throw 'INVOICE.ID_MISSING';
    //     const invoice = await this.invoiceModel.findOne({ _id: id });
    //     if (invoice.emails.length > 0) {
    //         await this.emailsService.removeInvoiceFromEmail(invoice.emails);
    //     }
    //     // Create feed item in email feed
    //     await this.feedsService.createFeed({
    //         invoiceId: id,
    //         porType: EnumFeedInvType.DELETE_INVOICE,
    //         userId,
    //         teamId: invoice.team._id,
    //     });
    //     return await this.invoiceModel.deleteOne({
    //         _id: mongoose.Types.ObjectId(id),
    //     });
    // }

    async getInvoicesBySupplierIds(supplierIds: string[]): Promise<InvoiceDocument[]> {
        const ids = supplierIds.map((s) => {
            return mongoose.Types.ObjectId(s);
        });
        return await this.invoiceModel.find({ supplier: { $in: ids } }).populate([
            'createdBy',
            'updatedBy',
            // 'team',
            'emails',
            'files',
            { path: 'subscribers', model: 'User' },
        ]);
    }

    async getInvoicesInSummary(
        teamId: string,
        timeZone: string,
        supplierId?: string,
    ): Promise<InvoicesSummaryType> {
        const tid = mongoose.Types.ObjectId(teamId);
        const sid = supplierId ? mongoose.Types.ObjectId(supplierId) : null;
        const aggr = aggrInvoicesInSummary(tid, timeZone, sid);
        const summary = await this.invoiceModel.aggregate(aggr);
        return summary[0];
    }

    async getInvoicesOutCount(teamId: string): Promise<any> {
        const suppliers = await this.supplierModel.find(
            { supplier: mongoose.Types.ObjectId(teamId) },
            { _id: 1 },
        );
        const supplierIds = suppliers.map((s) => s._id);
        return await this.invoiceModel.aggregate([
            {
                $match: {
                    supplier: { $in: supplierIds },
                },
            },
            {
                $group: {
                    _id: '$status',
                    count: {
                        $sum: 1,
                    },
                    amount: {
                        $sum: '$totalAmountWithVat_N',
                    },
                },
            },
        ]);
    }

    async unlinkEmailsFromInvoice(
        invoiceId: string,
        emailIds: string[],
        userId: string,
        teamId: string,
    ): Promise<string> {
        const now = new Date();
        const updates = [];
        await Promise.all(
            emailIds.map(async (id) => {
                const em = {
                    _id: id,
                    updatedAt: now,
                    updatedBy: userId,
                    teamId,
                };
                let email = await this.emailsService.unlinkInvoiceFromEmail(em);
                updates.push({ field: 'email', prevValue: email.subject, newValue: '' });
            }),
        );
        const inv = await this.invoiceModel.findOneAndUpdate(
            { _id: invoiceId },
            {
                $pull: { emails: { $in: emailIds } },
                updatedAt: now,
                updatedBy: mongoose.Types.ObjectId(userId),
            },
        );

        // Create feed item in invoice feed
        await this.feedsService.createFeed({
            invoice: invoiceId,
            type: EnumFeedType.INVOICE,
            subType: EnumFeedSubType.EMAIL_UNLINK,
            team: String(inv.team._id),
            userId,
            context: new InvoiceTypeContext(null, null, updates),
        });

        return 'INVOICE_EMAILS_UNLINK.SUCCESS';
    }

    async deleteFilesFromInvoice(
        invoiceId: string,
        fileIds: string[],
        teamId: string,
        userId: string,
    ): Promise<string> {
        await this.invoiceModel.updateOne(
            { _id: invoiceId },
            {
                $pull: { files: { $in: fileIds } },
                updatedAt: new Date(),
                updatedBy: mongoose.Types.ObjectId(userId),
            },
        );
        const updates = [];
        await Promise.all(
            fileIds.map(async (id) => {
                let deletedFile = await this.filesService.deleteFile(id, invoiceId, teamId);
                updates.push({ field: 'file', prevValue: deletedFile, newValue: '' });
            }),
        );
        // Create feed item in invoice feed
        await this.feedsService.createFeed({
            invoice: invoiceId,
            type: EnumFeedType.INVOICE,
            subType: EnumFeedSubType.INVOICE_FILE_DELETE,
            team: teamId,
            userId: userId,
            context: new InvoiceTypeContext(null, null, updates),
        });
        return 'INVOICE_FILES_DELETE.SUCCESS';
    }

    async updateInvoiceSubscribers(invoice: InvoiceInput): Promise<InvoiceType> {
        const subs = invoice.subscribers.map((s) => ({
            user: mongoose.Types.ObjectId(s.user),
            team: mongoose.Types.ObjectId(s.team),
        }));
        const res = await this.invoiceModel.findOneAndUpdate(
            { _id: invoice._id },
            { $set: { subscribers: subs } },
            { new: true },
        );

        return await this.getInvoiceById(invoice._id);
    }
}
