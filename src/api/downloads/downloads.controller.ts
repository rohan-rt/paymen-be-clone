import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { UseGuards } from '@nestjs/common';
import { SessionAuthGuard } from 'common/guards/session.guard';
import { JwtAuthGuard } from 'common/guards/jwt.guard';

// Import services
import { DownloadsService } from './downloads.service';

@Controller()
export class DownloadsController {
    constructor(private downloadsService: DownloadsService) {}

    @Get('get-file')
    @UseGuards(JwtAuthGuard)
    public async getFile(@Req() request: Request): Promise<string> {
        const input = {
            fileId: String(request.query.fileId), // Backblaze fileId
            userId: String(request.query.userId),
            type: String(request.query.type),
        };
        return await this.downloadsService.downloadFile(input);
    }
}
