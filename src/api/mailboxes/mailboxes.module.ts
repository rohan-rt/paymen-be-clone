import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { SessionSerializer } from 'common/serializer/session.serializer';
import { JwtStrategy } from 'common/strategies/jwt.strategy';

// Import schemas
import { UserSchema } from 'api/users/schemas/user.schema';
import { MailboxSchema } from './schemas/mailbox.schema';
import { EmailVerificationSchema } from 'api/email-verifications/schemas/email-verification.schema';

// Import services
import { RedisService } from 'api/redis/redis.service';
import { BackblazeService } from 'services/backblaze/backblaze.service';
import { UtilService } from 'utils/util.service';
import { UsersService } from 'api/users/users.service';
import { EmailService } from 'services/emails/email.service';
import { MailboxesService } from './mailboxes.service';
import { EmailServerService } from 'services/email-server/email-server.service';

// Import resolvers
import { MailboxesResolver } from './mailboxes.resolver';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: 'EmailVerification', schema: EmailVerificationSchema },
            { name: 'User', schema: UserSchema },
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

        UsersService,
        EmailService,
        MailboxesService,
        EmailServerService,

        MailboxesResolver,
    ],
    exports: [MailboxesService],
})
export class MailboxesModule implements NestModule {
    public configure(consumer: MiddlewareConsumer) {
        // consumer.apply(LoggerMiddleware).forRoutes(TeamsController);
    }
}
