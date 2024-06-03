import { Injectable, HttpStatus, HttpException, Options } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

// Import configs
import config from 'config';

// Import inputs
import { MailboxInput } from './inputs/mailbox.input';

// Import schemas
import { MailboxDocument } from './schemas/mailbox.schema';

// Import models
import { FeedUpdatesType } from 'api/feeds/models/feed-updates.model';

// Import services
import { EmailServerService } from 'services/email-server/email-server.service';

@Injectable()
export class MailboxesService {
    constructor(
        @InjectModel('Mailbox') private readonly mailboxModel: Model<MailboxDocument>,
        private readonly emailServerService: EmailServerService,
    ) { }

    async getMailboxByEmail(email): Promise<MailboxDocument> {
        return await this.mailboxModel.findOne({ email }, { __v: 0 });
    }

    async createMailbox(mailbox: MailboxInput, username: string): Promise<MailboxDocument> {
        const now = new Date();
        const email = `${username + '@' + config.keys.MAILCOW.DOMAIN}`;
        const newMailbox = new this.mailboxModel({
            invoiceType: mailbox.invoiceType,
            email: email,
            // secondaryAddress: mailbox?.secondaryAddress,
            updatedAt: now,
            createdAt: now,
        });

        await this.emailServerService.createMailbox(email);

        const savedMailbox = await newMailbox.save();

        return savedMailbox;
    }

    async updateMailBoxes(mailboxes: MailboxInput[]): Promise<FeedUpdatesType[]> {
        const now = new Date();
        let updates: any = [{ prevValue: '', newValue: '' }];
        await Promise.all(
            mailboxes.flatMap(async (m) => {
                const res = await this.mailboxModel.findOneAndUpdate(
                    {
                        _id: m._id,
                        $or: [
                            { invoiceType: { $ne: m.invoiceType } },
                            { email: { $ne: m.email } },
                            { status: { $ne: m.status } },
                            // { secondaryAddress: { $ne: m.secondaryAddress } },
                        ],
                    },
                    {
                        $set: {
                            invoiceType: m.invoiceType,
                            email: m.email,
                            status: m.status,
                            // secondaryAddress: m.secondaryAddress,
                            updatedAt: now,
                        },
                    },
                );
                /** Adding informtion to portal feed */
                if (res?.status && res.status !== m.status) {
                    updates.push({
                        field: 'mailbox',
                        parentField: 'invoiceTypes',
                        prevValue: res.status,
                        newValue: m.status,
                    });
                }
                return res ? res : [];
            }),
        );

        return updates;
    }
}
