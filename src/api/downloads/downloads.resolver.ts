import { Args, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SessionAuthGuard } from 'common/guards/session.guard';
import { JwtAuthGuard } from 'common/guards/jwt.guard';

// Import Services
import { DownloadsService } from './downloads.service';

//Import Inputs
import { DownloadInput } from './input/download.input';

// Import Models
import { DownloadType } from './model/download.model';

@Resolver()
export class DownloadsResolver {
    constructor(private downloadsService: DownloadsService) {}

    @Query((returns) => [DownloadType])
    @UseGuards(JwtAuthGuard)
    async getDownload(@Args({ name: 'downloadInput' }) downloadInput: DownloadInput) {
        return await this.downloadsService.getDownload(downloadInput);
    }

    @Query((returns) => String)
    @UseGuards(JwtAuthGuard)
    async downloadFile(@Args({ name: 'downloadInput' }) downloadInput: DownloadInput) {
        return await this.downloadsService.downloadFile(downloadInput);
    }
}
