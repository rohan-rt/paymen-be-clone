import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';

// Import schemas
import { ForgotPasswordSchema } from 'api/auth/schemas/forgot-password.schema';
import { UpdatePasswordSchema } from 'api/auth/schemas/update-password.schema';
import { EmailVerificationSchema } from 'api/email-verifications/schemas/email-verification.schema';

import { UserSchema } from 'api/users/schemas/user.schema';
import { SessionSchema } from './schemas/session.schema';
import { DeleteSessionsSchema } from 'api/sessions/schemas/delete-sessions.schema';
import { TeamSchema } from 'api/teams/schemas/team.schema';
import { MemberSchema } from 'api/members/schemas/member.schema';
import { TeamInvitationSchema } from 'api/team-invitations/schemas/team-invitation.schema';
import { PortalSchema } from 'api/portals/schemas/portal.schema';
import { EmailSchema } from 'api/emails/schema/email.schema';
import { EmailAttachmentSchema } from 'api/emails/schema/email-attachment.schema';
import { SupplierSchema } from 'api/suppliers/schemas/supplier.schema';
import { SupplierInvitationSchema } from 'api/supplier-invitations/schemas/supplier-invitation.schema';
import { InvoiceSchema } from 'api/invoices/schemas/invoice.schema';
import { FileSchema } from 'api/files/schemas/file.schema';
import { NotificationSchema } from 'api/notifications/schemas/notification.schema';
import { FeedSchema } from 'api/feeds/schemas/feed.schema';

// Import services
import { RedisService } from 'api/redis/redis.service';
import { BackblazeService } from 'services/backblaze/backblaze.service';
import { UtilService } from 'utils/util.service';
import { AuthService } from 'api/auth/auth.service';
import { EmailService } from 'services/emails/email.service';

import { UsersService } from 'api/users/users.service';
import { SessionsService } from './sessions.service';
import { TeamsService } from 'api/teams/teams.service';
import { TeamInvitationsService } from 'api/team-invitations/team-invitations.service';
import { MembersService } from 'api/members/members.service';
import { EmailsService } from 'api/emails/emails.service';
import { SuppliersService } from 'api/suppliers/suppliers.service';
import { SupplierInvitationsService } from 'api/supplier-invitations/supplier-invitations.service';
import { InvoicesService } from 'api/invoices/invoices.service';
import { FilesService } from 'api/files/files.service';
import { NotificationsService } from 'api/notifications/notifications.service';

import { FeedsService } from 'api/feeds/feeds.service';
import { SocketIoClientService } from 'api/socket-client/socket-io-client.service';

import { GatewaysModule } from 'api/gateways/gateways.module';
import { SocketIoClientModule } from 'api/socket-client/socket-io-client.module';
import { PortalsService } from 'api/portals/portals.service';
import { MailboxesService } from 'api/mailboxes/mailboxes.service';
import { EmailServerService } from 'services/email-server/email-server.service';
import { MailboxSchema } from 'api/mailboxes/schemas/mailbox.schema';

@Module({
    imports: [
        // GatewaysModule,
        SocketIoClientModule,
        MongooseModule.forFeature([
            { name: 'ForgotPassword', schema: ForgotPasswordSchema },
            { name: 'UpdatePassword', schema: UpdatePasswordSchema },
            { name: 'EmailVerification', schema: EmailVerificationSchema },

            { name: 'User', schema: UserSchema },
            { name: 'Sessions', schema: SessionSchema },
            { name: 'DeleteSessions', schema: DeleteSessionsSchema },
            { name: 'Team', schema: TeamSchema },
            { name: 'Member', schema: MemberSchema },
            { name: 'TeamInvitation', schema: TeamInvitationSchema },
            { name: 'Portal', schema: PortalSchema },
            { name: 'Email', schema: EmailSchema },
            { name: 'EmailAttachment', schema: EmailAttachmentSchema },
            { name: 'Supplier', schema: SupplierSchema },
            { name: 'SupplierInvitation', schema: SupplierInvitationSchema },
            { name: 'Invoice', schema: InvoiceSchema },
            { name: 'File', schema: FileSchema },
            { name: 'Notification', schema: NotificationSchema },
            { name: 'Feed', schema: FeedSchema },
            { name: 'Mailbox', schema: MailboxSchema },
        ]),
        HttpModule,
    ],
    providers: [
        RedisService,
        BackblazeService,
        UtilService,
        AuthService,
        EmailService,

        UsersService,
        SessionsService,
        TeamsService,
        TeamInvitationsService,
        MembersService,
        EmailsService,
        PortalsService,
        MailboxesService,
        EmailServerService,
        SuppliersService,
        SupplierInvitationsService,
        InvoicesService,
        FilesService,
        NotificationsService,

        FeedsService,
        // SocketIoClientService,
    ],
    exports: [SessionsService],
})
export class SessionsModule implements NestModule {
    public configure(consumer: MiddlewareConsumer) {}
}
