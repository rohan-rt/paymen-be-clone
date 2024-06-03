import { Injectable } from '@nestjs/common';
import { InjectRedis, DEFAULT_REDIS_NAMESPACE } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';

// Import configs
import config from 'config';

// Import services
import { BackblazeService } from 'services/backblaze/backblaze.service';

// TTL in seconds
const ttl = 60 * 60 * config.keys.REDIS.TTL;

@Injectable()
export class RedisService {
    constructor(
        @InjectRedis() private readonly redis: Redis,
        private readonly backblazeService: BackblazeService,
    ) {}

    async getData(fileName: string): Promise<string> {
        let file = await this.redis.get(fileName);
        if (!file) {
            const data = await this.backblazeService.fetchFile(fileName);
            if (data) {
                await this.setData(fileName, data);
                file = data;
            }
        }
        // ! Don't use if-else here!
        if (file) {
            await this.redis.expire(fileName, ttl);
            return Buffer.from(file, 'binary').toString('base64');
        } else return null;
    }

    async setData(fileName: string, file: Buffer) {
        const binaryFile = Buffer.from(file).toString('binary');
        await this.redis.set(fileName, binaryFile);
    }

    async deleteData(fileName: string) {
        await this.redis.del(fileName);
    }
}
