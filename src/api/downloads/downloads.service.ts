import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

// Import schemas
import { DownloadDocument } from './schema/download.schema';

// Import inputs
import { DownloadInput } from './input/download.input';

// Import models
import { DownloadType } from './model/download.model';

// Import services
import { BackblazeService } from 'services/backblaze/backblaze.service';

// Import configs
import config from 'config';

@Injectable()
export class DownloadsService {
    constructor(
        @InjectModel('Download') private downloadModel: Model<DownloadDocument>,
        @Inject(CACHE_MANAGER) protected readonly cacheManager,
        private readonly backblazeService: BackblazeService,
    ) {}

    async getDownload(downloadInput: DownloadInput): Promise<DownloadType> {
        return await this.downloadModel.findOne({
            createdBy: downloadInput.userId,
            fileId: downloadInput.fileId,
        });
    }

    async downloadFile(downloadInput: DownloadInput): Promise<string> {
        const fileName = downloadInput.fileId;
        const value = await this.cacheManager.get(fileName);
        if (value) return value;

        // Else ...
        const res = await this.incrementCount(downloadInput);
        const count = res.count;
        if (count <= config.keys.B2.downloadLimit) {
            // Use fileId for download via native Backblaze URL
            const file = await this.backblazeService.fetchFile(downloadInput.fileId, true);
            const base64 = Buffer.from(file).toString('base64');
            const ttl = config.keys.CACHE.TTL;
            this.cacheManager.set(fileName, base64, ttl);
            return base64;
        } else return 'DOWNLOAD.LIMIT_REACHED';
    }

    async incrementCount(downloadInput: DownloadInput): Promise<DownloadType> {
        return await this.downloadModel.findOneAndUpdate(
            {
                file: downloadInput.fileId,
                createdBy: downloadInput.userId,
            },
            {
                type: downloadInput.type,
                $inc: { count: 1 },
                $setOnInsert: { createdAt: new Date() },
            },
            { upsert: true, new: true },
        );
    }
}
