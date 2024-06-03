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
import { PortalSchema } from 'api/portals/schemas/portal.schema';
import { EmailSchema } from 'api/emails/schema/email.schema';
import { EmailAttachmentSchema } from 'api/emails/schema/email-attachment.schema';
import { SupplierSchema } from './schemas/supplier.schema';
import { InvoiceSchema } from 'api/invoices/schemas/invoice.schema';
import { FileSchema } from 'api/files/schemas/file.schema';
import { NotificationSchema } from 'api/notifications/schemas/notification.schema';
import { CurrencySchema } from 'api/currency/schemas/currency.schema';
import { FeedSchema } from 'api/feeds/schemas/feed.schema';

// Import services
import { RedisService } from 'api/redis/redis.service';
import { BackblazeService } from 'services/backblaze/backblaze.service';
import { EmailService } from 'services/emails/email.service';
import { UtilService } from 'utils/util.service';

import { UsersService } from 'api/users/users.service';
import { TeamsService } from 'api/teams/teams.service';
import { MembersService } from 'api/members/members.service';
import { EmailsService } from 'api/emails/emails.service';
import { SuppliersService } from './suppliers.service';
import { InvoicesService } from 'api/invoices/invoices.service';
import { FilesService } from 'api/files/files.service';
import { NotificationsService } from 'api/notifications/notifications.service';
import { CurrencyService } from 'api/currency/currency.service';

import { FeedsService } from 'api/feeds/feeds.service';
import { SocketIoClientService } from 'api/socket-client/socket-io-client.service';
// Import modules
import { TeamInvitationsModule } from 'api/team-invitations/team-invitations.module';
import { SupplierInvitationsModule } from 'api/supplier-invitations/supplier-invitations.module';

// Import resolvers
import { SuppliersResolver } from './suppliers.resolver';
import { GatewaysModule } from 'api/gateways/gateways.module';
import { TeamInvitationSchema } from 'api/team-invitations/schemas/team-invitation.schema';
import { SupplierInvitationSchema } from 'api/supplier-invitations/schemas/supplier-invitation.schema';
import { SocketIoClientModule } from 'api/socket-client/socket-io-client.module';
import { PortalsService } from 'api/portals/portals.service';
import { MailboxesService } from 'api/mailboxes/mailboxes.service';
import { EmailServerService } from 'services/email-server/email-server.service';
import { MailboxSchema } from 'api/mailboxes/schemas/mailbox.schema';
import { FeedsModule } from 'api/feeds/feeds.module';

@Module({
    imports: [
        // GatewaysModule,
        SocketIoClientModule,
        forwardRef(() => SupplierInvitationsModule),
        forwardRef(() => TeamInvitationsModule),
        MongooseModule.forFeature([
            { name: 'EmailVerification', schema: EmailVerificationSchema },
            { name: 'User', schema: UserSchema },
            { name: 'Team', schema: TeamSchema },
            { name: 'Member', schema: MemberSchema },
            { name: 'Portal', schema: PortalSchema },
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
            { name: 'Mailbox', schema: MailboxSchema },
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
        TeamsService,
        MembersService,
        EmailsService,
        SuppliersService,
        PortalsService,
        MailboxesService,
        EmailServerService,
        InvoicesService,
        FilesService,
        NotificationsService,
        CurrencyService,

        FeedsService,
        // SocketIoClientService,

        SuppliersResolver,
    ],
    exports: [SuppliersService],
})
export class SuppliersModule implements NestModule {
    public configure(consumer: MiddlewareConsumer) {
        // consumer.apply(LoggerMiddleware).forRoutes(PortalsController);
    }
}
