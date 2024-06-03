import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
// import { LoggerMiddleware } from '../../common/middlewares/logger.middleware';
import { SessionSerializer } from 'common/serializer/session.serializer';
import { JwtStrategy } from 'common/strategies/jwt.strategy';

// Import modules
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';

// Import services
import { RedisService } from 'api/redis/redis.service';
import { BackblazeService } from 'services/backblaze/backblaze.service';
import { UtilService } from 'utils/util.service';
import { UsersService } from 'api/users/users.service';
import { EmailService } from 'services/emails/email.service';
import { AllInvitationsService } from './all-invitations.service';

// Import resolvers
import { AllInvitationsResolver } from './all-invitations.resolver';

// Import schemas
import { UserSchema } from 'api/users/schemas/user.schema';
import { NotificationSchema } from 'api/notifications/schemas/notification.schema';
import { EmailVerificationSchema } from 'api/email-verifications/schemas/email-verification.schema';
import { TeamInvitationSchema } from 'api/team-invitations/schemas/team-invitation.schema';
import { SupplierInvitationSchema } from 'api/supplier-invitations/schemas/supplier-invitation.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: 'EmailVerification', schema: EmailVerificationSchema },
            { name: 'User', schema: UserSchema },
            { name: 'TeamInvitation', schema: TeamInvitationSchema },
            { name: 'SupplierInvitation', schema: SupplierInvitationSchema },
            { name: 'Notification', schema: NotificationSchema },
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
        AllInvitationsService,

        AllInvitationsResolver,
    ],
    exports: [AllInvitationsService],
})
export class AllInvitationsModule implements NestModule {
    public configure(consumer: MiddlewareConsumer) {
        // consumer.apply(LoggerMiddleware).forRoutes(TeamsController);
    }
}
