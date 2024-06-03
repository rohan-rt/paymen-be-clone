import { InjectModel } from '@nestjs/mongoose';
import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { Model } from 'mongoose';
const mongoose = require('mongoose');

// Import helpers
import { populateParams } from './helpers/emails.helpers';
const popParams = populateParams();

// Import schemas
import { EmailDocument, EnumEmailStatus } from './schema/email.schema';
import { InvoiceDocument } from 'api/invoices/schemas/invoice.schema';
import { EmailAttachmentDocument } from './schema/email-attachment.schema';

// Import inputs
import { EmailsInput } from './input/emails.input';
import { EmailInput } from './input/email.input';
import { EmailAttachmentInput } from './input/email-attachment.input';

// Import services
import { FeedsService } from 'api/feeds/feeds.service';

// Import models
import { EmailType } from './model/email.model';
import { EmailAcceptType } from './model/email-accept.model';
import { EmailAttachmentType } from './model/email-attachment.model';
import { EnumFeedSubType, EnumFeedType } from 'api/feeds/schemas/feed.schema';
import { GeneralContext, InvoiceTypeContext } from 'api/feeds/models/contexts.model';
@Injectable()
export class EmailsService {
    constructor(
        @InjectModel('Email')
        private readonly emailModel: Model<EmailDocument>,
        @InjectModel('EmailAttachment')
        private readonly emailAttachmentModel: Model<EmailAttachmentDocument>,
        @InjectModel('Invoice') private readonly invoiceModel: Model<InvoiceDocument>,

        @Inject(forwardRef(() => FeedsService))
        private readonly feedsService: FeedsService,
    ) {}

    async getEmailById(emailId: string, mode?: number): Promise<EmailType> {
        // Mode 1 - minimal data retrieved
        if (mode) return await this.emailModel.findById(emailId);
        else return await this.emailModel.findById(emailId).populate(popParams);
    }

    async getEmailsByPortal(portalId: string): Promise<EmailType[]> {
        return await this.emailModel.find({ portal: mongoose.Types.ObjectId(portalId) }).populate([
            'attachments',
            // 'team',
            'portal',
            'invoice',
        ]);
    }

    async getEmailsByTeam(teamId: string): Promise<EmailType[]> {
        return await this.emailModel
            .find({ team: mongoose.Types.ObjectId(teamId) })
            .populate(popParams);
    }

    async updateEmail(email: EmailInput): Promise<EmailType> {
        if (!email?.updatedAt) email.updatedAt = new Date();
        const em = new this.emailModel(email);
        return await this.emailModel.findOneAndUpdate(
            { _id: email._id },
            { $set: em },
            { new: true },
        );
    }

    async updateEmailAttachment(attachment: EmailAttachmentInput): Promise<EmailAttachmentType> {
        if (!attachment?.updatedAt) attachment.updatedAt = new Date();
        const att = new this.emailAttachmentModel(attachment);
        return await this.emailAttachmentModel.findOneAndUpdate(
            { _id: attachment._id },
            { $set: att },
            { new: true },
        );
    }

    async updateEmailStatus(lem: EmailsInput): Promise<EmailType[]> {
        const uid = mongoose.Types.ObjectId(lem.userId);
        const email: any = {
            status: lem.status,
            updatedAt: new Date(),
            updatedBy: uid,
        };
        // If invoiceId is provided, update email record too with it
        if (lem?.invoiceId) email.invoice = mongoose.Types.ObjectId(lem.invoiceId);
        // If linkedAt is provided, update email record with linkedt and linkedBy
        if (lem?.linkedAt) {
            email.linkedAt = lem.linkedAt;
            email.linkedBy = uid;
        }
        // If any other status is provided, make sure to set 'treated' to true
        if (lem?.status !== EnumEmailStatus.NEW) {
            email.treated = true;
        }

        const oldVals = await this.emailModel.find({ _id: { $in: lem.emailIds } });

        await this.emailModel.updateMany(
            { $or: [{ _id: { $in: lem.emailIds } }] },
            { $set: email },
        );
        /** Adding information to each email feed */
        lem.emailIds.forEach(async (e) => {
            const oldEmail = oldVals.find((ov) => String(ov._id) === e);

            await this.feedsService.createFeed({
                email: e,
                type: EnumFeedType.EMAIL,
                subType: EnumFeedSubType.EMAIL_STATUS_UPDATE,
                context: new InvoiceTypeContext(null, null, [
                    { field: 'status', prevValue: oldEmail.status, newValue: lem.status },
                ]),
                userId: lem.userId,
                team: lem.teamId,
            });
        });
        return await this.getEmailsByTeam(lem.teamId);
    }

    async updateEmailPortal(lem: EmailsInput): Promise<EmailType[]> {
        if (!lem.portalId) {
            throw 'EMAIL.UPDATE.PORTAL_ID_MISSING';
        } else if (!lem.invoiceTypeId) {
            throw 'EMAIL.UPDATE.INVOICETYPE_ID_MISSING';
        }

        //Get old values for feed
        const oldVals = await this.emailModel
            .find({ _id: { $in: lem.emailIds } })
            .populate('portal');

        await this.emailModel.updateMany(
            { $or: [{ _id: { $in: lem.emailIds } }] },
            {
                portal: mongoose.Types.ObjectId(lem.portalId),
                invoiceType: lem.invoiceTypeId,
                updatedAt: new Date(),
                updatedBy: mongoose.Types.ObjectId(lem.userId),
            },
        );
        const res = await this.getEmailsByTeam(lem.teamId);

        /** Adding information to each email feed */
        lem.emailIds.forEach(async (e) => {
            const oldEmail = oldVals.find((ov) => String(ov._id) === e);
            await this.feedsService.createFeed({
                email: e,
                type: EnumFeedType.EMAIL,
                subType: EnumFeedSubType.EMAIL_UPDATE,
                context: new InvoiceTypeContext(null, null, [
                    {
                        field: 'portal',
                        prevValue: oldEmail.portal.name,
                        newValue: res[0].portal.name,
                    },
                    {
                        field: 'invoiceType',
                        prevValue: oldEmail.portal.invoiceTypes.find(
                            (oit) => oit.id === oldEmail.invoiceType,
                        ).name,
                        newValue: res[0].portal.invoiceTypes.find(
                            (it) => it.id === lem.invoiceTypeId,
                        ).name,
                    },
                ]),
                userId: lem.userId,
                team: lem.teamId,
            });
        });
        return res;
    }

    async acceptInExistingInvoice(lem: EmailsInput): Promise<EmailAcceptType> {
        const now = new Date();
        const uid = mongoose.Types.ObjectId(lem.userId);
        const invoice = await this.invoiceModel.findOneAndUpdate(
            { _id: lem.invoiceId },
            {
                $push: { emails: { $each: lem.emailIds } },
                updatedAt: now,
                updatedBy: uid,
            },
        );
        await this.emailModel.updateMany(
            { $or: [{ _id: { $in: lem.emailIds } }] },
            {
                treated: true,
                status: EnumEmailStatus.ACCEPTED,
                portal: mongoose.Types.ObjectId(lem.portalId),
                invoiceType: lem.invoiceTypeId,
                invoice: mongoose.Types.ObjectId(lem.invoiceId),
                linkedAt: now,
                linkedBy: uid,
                updatedAt: now,
                updatedBy: uid,
            },
        );
        /** Adding informtion to email feed */
        lem.emailIds.forEach(async (e) => {
            await this.feedsService.createFeed({
                email: e,
                type: EnumFeedType.EMAIL,
                subType: EnumFeedSubType.EMAIL_LINK,
                context: new InvoiceTypeContext(null, null, [
                    { field: 'invoice', newValue: invoice.invoiceNumber_C },
                ]),
                userId: lem.userId,
                team: lem.teamId,
            });
        });
        /** Adding informtion to invoice feed */
        const updatedEmails = await this.emailModel.find({ _id: { $in: lem.emailIds } });

        const updatesForInv = [];
        updatedEmails.forEach((e) => {
            updatesForInv.push({ field: 'email', newValue: e.subject });
        });

        await this.feedsService.createFeed({
            invoice: invoice._id,
            type: EnumFeedType.INVOICE,
            subType: EnumFeedSubType.EMAIL_LINK,
            context: new InvoiceTypeContext(null, null, updatesForInv),
            userId: lem.userId,
            team: lem.teamId,
        });

        return { message: 'EMAILS.ACCEPTED' };
    }

    async downloadAllAttachments(emailId: string) {
        const email = await this.emailModel.findOne({ _id: emailId });
        return email.attachments;
    }

    // async getInvoicesOfEmails(emails: EmailDocument[]): Promise<EmailType[]> {
    //     let res = []
    //     const emailIds = emails.map(e => e._id);
    //     const invoices = await this.invoicesService.getInvoiceForEmail(emailIds);
    //     emails.map((email, i) => {
    //         let invoice = invoices.find(inv => inv.emails.includes(email._id));
    //         res.push(email);
    //         res[i]['invoice'] = invoice;
    //     })
    //     return emails
    // }

    async unlinkInvoiceFromEmail(email: EmailInput): Promise<EmailType> {
        if (!email?.updatedAt) email.updatedAt = new Date();

        // Create feed item in email feed
        await this.feedsService.createFeed({
            email: email._id,
            type: EnumFeedType.EMAIL,
            subType: EnumFeedSubType.EMAIL_UNLINK,
            userId: email.updatedBy,
            team: email.teamId,
        });

        return await this.emailModel.findOneAndUpdate(
            { _id: email._id },
            {
                $unset: { invoice: 1, linkedAt: 1, linkedBy: 1 },
                status: EnumEmailStatus.ARCHIVED,
                updatedAt: email.updatedAt,
                updatedBy: mongoose.Types.ObjectId(email.updatedBy),
            },
            { new: true },
        );
    }

    async removeInvoiceFromEmail(emailIds) {
        await this.emailModel.updateMany(
            { _id: { $in: emailIds } },
            { invoice: null, status: EnumEmailStatus.NEW },
        );
    }
}
