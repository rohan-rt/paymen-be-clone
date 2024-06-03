import { Module, NestModule, MiddlewareConsumer, forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { SessionSerializer } from 'common/serializer/session.serializer';
import { JwtStrategy } from 'common/strategies/jwt.strategy';

// Import schemas
import { EmailVerificationSchema } from 'api/email-verifications/schemas/email-verification.schema';
import { UserSchema } from 'api/users/schemas/user.schema';
import { TeamSchema } from 'api/teams/schemas/team.schema';
import { MemberSchema } from 'api/members/schemas/member.schema';
import { PortalSchema } from './schemas/portal.schema';
import { MailboxSchema } from 'api/mailboxes/schemas/mailbox.schema';
import { EmailServerService } from 'services/email-server/email-server.service';
import { SupplierSchema } from 'api/suppliers/schemas/supplier.schema';
import { EmailSchema } from 'api/emails/schema/email.schema';
import { EmailAttachmentSchema } from 'api/emails/schema/email-attachment.schema';
import { InvoiceSchema } from 'api/invoices/schemas/invoice.schema';
import { FileSchema } from '../files/schemas/file.schema';
import { NotificationSchema } from 'api/notifications/schemas/notification.schema';
import { CurrencySchema } from 'api/currency/schemas/currency.schema';
import { FeedSchema } from 'api/feeds/schemas/feed.schema';
import { TeamInvitationSchema } from 'api/team-invitations/schemas/team-invitation.schema';
import { SupplierInvitationSchema } from 'api/supplier-invitations/schemas/supplier-invitation.schema';

// Import services
import { RedisService } from 'api/redis/redis.service';
import { BackblazeService } from 'services/backblaze/backblaze.service';
import { UtilService } from 'utils/util.service';
import { EmailService } from 'services/emails/email.service';

import { UsersService } from 'api/users/users.service';
import { MembersService } from 'api/members/members.service';
import { PortalsService } from './portals.service';
import { MailboxesService } from 'api/mailboxes/mailboxes.service';
import { EmailsService } from 'api/emails/emails.service';
import { InvoicesService } from 'api/invoices/invoices.service';
import { FilesService } from '../files/files.service';
import { NotificationsService } from 'api/notifications/notifications.service';
import { CurrencyService } from 'api/currency/currency.service';

import { FeedsService } from 'api/feeds/feeds.service';
import { SocketIoClientService } from 'api/socket-client/socket-io-client.service';

// Import resolvers
import { PortalsResolver } from './portals.resolver';

// Import modules
import { TeamInvitationsModule } from 'api/team-invitations/team-invitations.module';
import { GatewaysModule } from 'api/gateways/gateways.module';
import { SocketIoClientModule } from 'api/socket-client/socket-io-client.module';
import { SuppliersService } from 'api/suppliers/suppliers.service';
import { SupplierInvitationsService } from 'api/supplier-invitations/supplier-invitations.service';
import { TeamsService } from 'api/teams/teams.service';

@Module({
    imports: [
        // GatewaysModule,
        SocketIoClientModule,
        forwardRef(() => TeamInvitationsModule),
        MongooseModule.forFeature([
            { name: 'EmailVerification', schema: EmailVerificationSchema },
            { name: 'User', schema: UserSchema },
            { name: 'Team', schema: TeamSchema },
            { name: 'Member', schema: MemberSchema },
            { name: 'Portal', schema: PortalSchema },
            { name: 'Mailbox', schema: MailboxSchema },
            { name: 'Email', schema: EmailSchema },
            { name: 'EmailAttachment', schema: EmailAttachmentSchema },
            { name: 'Supplier', schema: SupplierSchema },
            { name: 'Invoice', schema: InvoiceSchema },
            { name: 'File', schema: FileSchema },
            { name: 'Notification', schema: NotificationSchema },
            { name: 'Currency', schema: CurrencySchema },
            { name: 'Feed', schema: FeedSchema },
            { name: 'TeamInvitation', schema: TeamInvitationSchema },
            { name: 'SupplierInvitation', schema: SupplierInvitationSchema },
        ]),
        HttpModule,
    ],
    providers: [
        SessionSerializer,
        JwtStrategy,

        RedisService,
        BackblazeService,
        UtilService,
        EmailService,

        UsersService,
        MembersService,
        PortalsService,
        EmailsService,
        MailboxesService,
        EmailServerService,
        InvoicesService,
        TeamsService,
        SuppliersService,
        SupplierInvitationsService,
        FilesService,
        NotificationsService,
        CurrencyService,

        FeedsService,
        // SocketIoClientService,

        PortalsResolver,
    ],
    exports: [PortalsService],
})
export class PortalsModule implements NestModule {
    public configure(consumer: MiddlewareConsumer) {
        // consumer.apply(LoggerMiddleware).forRoutes(PortalsController);
    }
}
