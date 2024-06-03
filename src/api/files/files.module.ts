import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { SessionSerializer } from 'common/serializer/session.serializer';
import { JwtStrategy } from 'common/strategies/jwt.strategy';

// Import resolvers
import { FilesResolver } from './files.resolver';

// Import services
import { RedisService } from 'api/redis/redis.service';
import { BackblazeService } from 'services/backblaze/backblaze.service';
import { UtilService } from 'utils/util.service';
import { EmailService } from 'services/emails/email.service';
import { UsersService } from 'api/users/users.service';
import { FilesService } from './files.service';

// Import schemas
import { EmailVerificationSchema } from 'api/email-verifications/schemas/email-verification.schema';
import { UserSchema } from '../users/schemas/user.schema';
import { FileSchema } from './schemas/file.schema';
import { InvoiceSchema } from '../invoices/schemas/invoice.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: 'EmailVerification', schema: EmailVerificationSchema },
            { name: 'User', schema: UserSchema },
            { name: 'Invoice', schema: InvoiceSchema },
            { name: 'File', schema: FileSchema },
        ]),
        HttpModule,
    ],
    providers: [
        JwtStrategy,

        SessionSerializer,

        RedisService,
        BackblazeService,
        UtilService,
        UsersService,
        EmailService,
        FilesService,

        FilesResolver,
    ],
    exports: [FilesService],
})
export class FilesModule implements NestModule {
    public configure(consumer: MiddlewareConsumer) {}
}
