import { join } from 'path';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

// Import controllers
import { AppController } from './app.controller';

// Import services
import { AppService } from './app.service';

// Import modules
import { TasksModule } from './tasks/tasks.module';
import { SocketIoClientModule } from 'api/socket-client/socket-io-client.module';
import { NotificationsModule } from 'api/notifications/notifications.module';
import { RedisDBModule } from 'api/redis/redis.module';

import { AuthModule } from './api/auth/auth.module';
import { UsersModule } from './api/users/users.module';
import { SessionsModule } from 'api/sessions/sessions.module';
import { TeamsModule } from 'api/teams/teams.module';
import { PortalsModule } from 'api/portals/portals.module';
import { MembersModule } from 'api/members/members.module';
import { SuppliersModule } from 'api/suppliers/suppliers.module';
import { AllInvitationsModule } from 'api/all-invitations/all-invitations.module';
import { TeamInvitationsModule } from 'api/team-invitations/team-invitations.module';
import { SupplierInvitationsModule } from 'api/supplier-invitations/supplier-invitations.module';
import { EmailsModule } from 'api/emails/emails.module';
import { MailboxesModule } from 'api/mailboxes/mailboxes.module';
import { InvoicesModule } from 'api/invoices/invoices.module';
import { FilesModule } from 'api/files/files.module';
import { ViewsModule } from 'api/views/views.module';
import { CurrencyModule } from 'api/currency/currency.module';

import { FeedsModule } from 'api/feeds/feeds.module';
import { DownloadsModule } from 'api/downloads/downloads.module';
import { RedisModule } from '@liaoliaots/nestjs-redis';

// Import configs
import config from 'config';
import { SocketClientModule } from 'api/gateways/client/socket-client.module';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        MongooseModule.forRootAsync({
            useFactory: async () => ({
                uri: config.keys.MONGO.URI,
                useNewUrlParser: true,
                useUnifiedTopology: true,
                // useFindAndModify: false,
                // useCreateIndex: true, //make this true
                autoIndex: true, //make this also true
            }),
        }),
        CacheModule.register({
            isGlobal: true,
            ttl: 10 * 1000,
        }),
        RedisModule.forRoot({
            config: {
                host: config.keys.REDIS.HOST,
                port: config.keys.REDIS.PORT,
                password: config.keys.REDIS.PASSWORD,
            },
        }),
        GraphQLModule.forRoot<ApolloDriverConfig>({
            driver: ApolloDriver,
            autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
            debug: true,
            playground: true,
            installSubscriptionHandlers: true,
            context: ({ req }) => ({ req }),
            cors: {
                credentials: true,
                allowedHeaders:
                    'Content-Type, X-Requested-With, Accept, Authorization, Access-Control-Allow-Origin',
                origin: [config.keys.WEB_URI, `${config.keys.WEB_URI}/*`],
            },
        }),

        TasksModule,
        SocketIoClientModule,
        NotificationsModule,
        RedisDBModule,
        DownloadsModule,

        AuthModule,
        UsersModule,
        SessionsModule,
        TeamsModule,
        MembersModule,
        SuppliersModule,
        PortalsModule,
        AllInvitationsModule,
        TeamInvitationsModule,
        SupplierInvitationsModule,
        EmailsModule,
        MailboxesModule,
        InvoicesModule,
        FilesModule,
        ViewsModule,
        CurrencyModule,

        FeedsModule,

    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }
