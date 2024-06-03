import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { SessionSerializer } from 'common/serializer/session.serializer';
import { JwtStrategy } from 'common/strategies/jwt.strategy';

// Import schemas
import { UserSchema } from 'api/users/schemas/user.schema';
import { TeamSchema } from 'api/teams/schemas/team.schema';
import { EmailVerificationSchema } from 'api/email-verifications/schemas/email-verification.schema';
import { NotificationSchema } from './schemas/notification.schema';

// Import services
import { RedisService } from 'api/redis/redis.service';
import { BackblazeService } from 'services/backblaze/backblaze.service';
import { UtilService } from 'utils/util.service';
import { UsersService } from 'api/users/users.service';
import { EmailService } from 'services/emails/email.service';
import { NotificationsService } from './notifications.service';

// Import resolvers
import { NotificationsResolver } from './notifications.resolver';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: 'EmailVerification', schema: EmailVerificationSchema },
            { name: 'User', schema: UserSchema },
            { name: 'Team', schema: TeamSchema },
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
        NotificationsService,


        NotificationsResolver,
    ],
    exports: [NotificationsService],
})
export class NotificationsModule implements NestModule {
    public configure(consumer: MiddlewareConsumer) {
        // consumer.apply(LoggerMiddleware).forRoutes(NotificationsController);
    }
}
