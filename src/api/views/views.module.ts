import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtStrategy } from 'common/strategies/jwt.strategy';

// Import schemas
import { EmailVerificationSchema } from 'api/email-verifications/schemas/email-verification.schema';
import { UserSchema } from 'api/users/schemas/user.schema';
import { TeamSchema } from 'api/teams/schemas/team.schema';
import { ViewSchema } from './schemas/view.schema';

// Import services
import { RedisService } from 'api/redis/redis.service';
import { BackblazeService } from 'services/backblaze/backblaze.service';
import { UtilService } from 'utils/util.service';
import { EmailService } from 'services/emails/email.service';

import { UsersService } from 'api/users/users.service';
import { ViewsService } from './views.service';

// Import resolvers
import { ViewsResolver } from './views.resolver';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: 'EmailVerification', schema: EmailVerificationSchema },
            { name: 'User', schema: UserSchema },
            { name: 'Team', schema: TeamSchema },
            { name: 'View', schema: ViewSchema },
        ]),
        HttpModule,
    ],
    providers: [
        JwtStrategy,

        RedisService,
        BackblazeService,
        UtilService,
        EmailService,

        UsersService,
        ViewsService,

        ViewsResolver,
    ] /*,TeamsService, UsersService]*/,
    exports: [ViewsService],
})
export class ViewsModule implements NestModule {
    public configure(consumer: MiddlewareConsumer) {}
}
