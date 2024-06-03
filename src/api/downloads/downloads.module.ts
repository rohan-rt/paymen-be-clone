import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';

// Import controllers
import { DownloadsController } from './downloads.controller';

// Import resolvers
import { DownloadsResolver } from './downloads.resolver';

// import schemas
import { DownloadSchema } from './schema/download.schema';

// Import services
import { DownloadsService } from './downloads.service';
import { BackblazeService } from 'services/backblaze/backblaze.service';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: 'Download', schema: DownloadSchema }]),
        HttpModule,
    ],
    controllers: [DownloadsController],
    providers: [DownloadsResolver, DownloadsService, BackblazeService],
    exports: [DownloadsService],
})
export class DownloadsModule implements NestModule {
    public configure(consumer: MiddlewareConsumer) {}
}
