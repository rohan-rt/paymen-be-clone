import { Module, NestModule, MiddlewareConsumer, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { SessionSerializer } from 'common/serializer/session.serializer';
import { JwtStrategy } from 'common/strategies/jwt.strategy';

// Import schemas
import { NotificationSchema } from 'api/notifications/schemas/notification.schema';
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

// Import services
import { RedisService } from 'api/redis/redis.service';
import { BackblazeService } from 'services/backblaze/backblaze.service';
import { UtilService } from 'utils/util.service';
import { EmailService } from 'services/emails/email.service';
import { NotificationsService } from 'api/notifications/notifications.service';

import { UsersService } from 'api/users/users.service';
import { TeamsService } from 'api/teams/teams.service';
import { TeamInvitationsService } from 'api/team-invitations/team-invitations.service';
import { MembersService } from 'api/members/members.service';
import { EmailsService } from 'api/emails/emails.service';
import { SuppliersService } from 'api/suppliers/suppliers.service';
import { SupplierInvitationsService } from 'api/supplier-invitations/supplier-invitations.service';
import { InvoicesService } from 'api/invoices/invoices.service';
import { FilesService } from 'api/files/files.service';
import { SocketIoClientService } from 'api/socket-client/socket-io-client.service';

import { FeedsService } from './feeds.service';

// Import resolvers and modules
import { FeedsResolver } from './feeds.resolver';
import { FeedSchema } from './schemas/feed.schema';
import { GatewaysModule } from 'api/gateways/gateways.module';
import { SocketIoClientModule } from 'api/socket-client/socket-io-client.module';
import { PortalsService } from 'api/portals/portals.service';
import { MailboxesService } from 'api/mailboxes/mailboxes.service';
import { MailboxSchema } from 'api/mailboxes/schemas/mailbox.schema';
import { EmailServerService } from 'services/email-server/email-server.service';

@Module({
    imports: [
        SocketIoClientModule,
        MongooseModule.forFeature([
            { name: 'EmailVerification', schema: EmailVerificationSchema },
            { name: 'Notification', schema: NotificationSchema },

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
            { name: 'Feed', schema: FeedSchema },
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
        NotificationsService,

        UsersService,
        TeamsService,
        TeamInvitationsService,
        MembersService,
        PortalsService,
        MailboxesService,
        EmailServerService,

        SuppliersService,
        SupplierInvitationsService,

        InvoicesService,
        FilesService,
        EmailsService,

        FeedsService,
        FeedsResolver,

        // SocketIoClientService,
    ],
    exports: [FeedsService],
})
export class FeedsModule implements NestModule {
    public configure(consumer: MiddlewareConsumer) {
        // consumer.apply(LoggerMiddleware).forRoutes(FeedsController);
    }
}
