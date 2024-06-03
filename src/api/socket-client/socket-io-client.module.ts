import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';

// Import schemas
import { EmailVerificationSchema } from 'api/email-verifications/schemas/email-verification.schema';
import { UserSchema } from 'api/users/schemas/user.schema';
import { TeamSchema } from 'api/teams/schemas/team.schema';
import { TeamInvitationSchema } from 'api/team-invitations/schemas/team-invitation.schema';
import { MemberSchema } from 'api/members/schemas/member.schema';
import { PortalSchema } from 'api/portals/schemas/portal.schema';
import { EmailSchema } from 'api/emails/schema/email.schema';
import { EmailAttachmentSchema } from 'api/emails/schema/email-attachment.schema';
import { SupplierSchema } from 'api/suppliers/schemas/supplier.schema';
import { SupplierInvitationSchema } from 'api/supplier-invitations/schemas/supplier-invitation.schema';
import { InvoiceSchema } from 'api/invoices/schemas/invoice.schema';
import { FileSchema } from 'api/files/schemas/file.schema';
import { NotificationSchema } from 'api/notifications/schemas/notification.schema';
import { CurrencySchema } from 'api/currency/schemas/currency.schema';

import { FeedSchema } from 'api/feeds/schemas/feed.schema';

// Import services
import { RedisService } from 'api/redis/redis.service';
import { BackblazeService } from 'services/backblaze/backblaze.service';
import { UtilService } from 'utils/util.service';
import { EmailService } from 'services/emails/email.service';

import { UsersService } from 'api/users/users.service';
import { TeamsService } from 'api/teams/teams.service';
import { TeamInvitationsService } from 'api/team-invitations/team-invitations.service';
import { MembersService } from 'api/members/members.service';
import { EmailsService } from 'api/emails/emails.service';
import { SuppliersService } from 'api/suppliers/suppliers.service';
import { SupplierInvitationsService } from 'api/supplier-invitations/supplier-invitations.service';
import { InvoicesService } from 'api/invoices/invoices.service';
import { FilesService } from 'api/files/files.service';
import { NotificationsService } from 'api/notifications/notifications.service';
import { CurrencyService } from 'api/currency/currency.service';

import { FeedsService } from 'api/feeds/feeds.service';
import { SocketIoClientService } from './socket-io-client.service';
import { PortalsService } from 'api/portals/portals.service';
import { MailboxesService } from 'api/mailboxes/mailboxes.service';
import { MailboxSchema } from 'api/mailboxes/schemas/mailbox.schema';
import { EmailServerService } from 'services/email-server/email-server.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: 'EmailVerification', schema: EmailVerificationSchema },
            { name: 'User', schema: UserSchema },
            { name: 'Team', schema: TeamSchema },
            { name: 'TeamInvitation', schema: TeamInvitationSchema },
            { name: 'Member', schema: MemberSchema },
            { name: 'Portal', schema: PortalSchema },
            { name: 'Email', schema: EmailSchema },
            { name: 'EmailAttachment', schema: EmailAttachmentSchema },
            { name: 'Supplier', schema: SupplierSchema },
            { name: 'SupplierInvitation', schema: SupplierInvitationSchema },
            { name: 'Invoice', schema: InvoiceSchema },
            { name: 'File', schema: FileSchema },
            { name: 'Notification', schema: NotificationSchema },
            { name: 'Currency', schema: CurrencySchema },
            { name: 'Mailbox', schema: MailboxSchema },

            { name: 'Feed', schema: FeedSchema },
        ]),
        HttpModule,
    ],
    providers: [
        SocketIoClientService,

        RedisService,
        BackblazeService,
        UtilService,
        EmailService,

        UsersService,
        TeamsService,
        TeamInvitationsService,
        MembersService,
        PortalsService,
        MailboxesService,
        SuppliersService,
        SupplierInvitationsService,
        EmailsService,
        InvoicesService,
        FilesService,
        NotificationsService,
        CurrencyService,
        EmailServerService,

        FeedsService,
    ],
    exports: [SocketIoClientService],
})
export class SocketIoClientModule {}
