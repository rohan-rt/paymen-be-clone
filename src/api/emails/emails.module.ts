import { Module, NestModule, MiddlewareConsumer, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SessionSerializer } from 'common/serializer/session.serializer';
import { JwtStrategy } from 'common/strategies/jwt.strategy';

// Import modules
import { HttpModule } from '@nestjs/axios';
import { TeamInvitationsModule } from 'api/team-invitations/team-invitations.module';

// Import schemas
import { NotificationSchema } from 'api/notifications/schemas/notification.schema';
import { EmailVerificationSchema } from 'api/email-verifications/schemas/email-verification.schema';
import { UserSchema } from 'api/users/schemas/user.schema';
import { TeamSchema } from 'api/teams/schemas/team.schema';
import { MemberSchema } from 'api/members/schemas/member.schema';
import { PortalSchema } from 'api/portals/schemas/portal.schema';
import { SupplierSchema } from 'api/suppliers/schemas/supplier.schema';
import { EmailSchema } from './schema/email.schema';
import { EmailAttachmentSchema } from './schema/email-attachment.schema';
import { InvoiceSchema } from 'api/invoices/schemas/invoice.schema';
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
import { EmailsService } from './emails.service';
import { NotificationsService } from 'api/notifications/notifications.service';

import { FeedsService } from 'api/feeds/feeds.service';
import { SocketIoClientService } from 'api/socket-client/socket-io-client.service';

// Import resolvers
import { EmailsResolver } from './emails.resolver';
import { SocketIoClientModule } from 'api/socket-client/socket-io-client.module';
import { PortalsService } from 'api/portals/portals.service';
import { MailboxesService } from 'api/mailboxes/mailboxes.service';
import { EmailServerService } from 'services/email-server/email-server.service';
import { MailboxSchema } from 'api/mailboxes/schemas/mailbox.schema';
import { SuppliersService } from 'api/suppliers/suppliers.service';
import { SupplierInvitationsService } from 'api/supplier-invitations/supplier-invitations.service';
import { TeamsService } from 'api/teams/teams.service';
import { InvoicesService } from 'api/invoices/invoices.service';
import { FilesService } from 'api/files/files.service';
import { FileSchema } from 'api/files/schemas/file.schema';

@Module({
    imports: [
        forwardRef(() => TeamInvitationsModule),
        SocketIoClientModule,
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
            { name: 'Notification', schema: NotificationSchema },
            { name: 'Feed', schema: FeedSchema },
            { name: 'TeamInvitation', schema: TeamInvitationSchema },
            { name: 'SupplierInvitation', schema: SupplierInvitationSchema },
            { name: 'Mailbox', schema: MailboxSchema },
            { name: 'File', schema: FileSchema },
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
        EmailsService,
        NotificationsService,
        PortalsService,
        MailboxesService,
        EmailServerService,

        TeamsService,
        InvoicesService,
        SuppliersService,
        SupplierInvitationsService,

        FeedsService,
        FilesService,
        EmailsResolver,

        // SocketIoClientService,
    ],
    exports: [EmailsService],
})
export class EmailsModule implements NestModule {
    public configure(consumer: MiddlewareConsumer) {
        // consumer.apply(LoggerMiddleware).forRoutes(EmailsController);
    }
}
