import { Controller, Get, Req, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { Request } from 'express';
import { UseGuards } from '@nestjs/common';
import { SessionAuthGuard } from 'common/guards/session.guard';
import { JwtAuthGuard } from 'common/guards/jwt.guard';

// Import services
import { RedisService } from './redis.service';

@Controller()
export class RedisController {
    constructor(private redisService: RedisService) {}

    @Get('get-image')
    // @UseGuards(JwtAuthGuard) // ! No need to guard it anymore thanks to Redis
    @UseInterceptors(CacheInterceptor)
    public async getImage(@Req() request: Request): Promise<string> {
        const fileName = request.query.fileName;
        const res = await this.redisService.getData(String(fileName));
        return res ? `data:image/png;base64,${res}` : null;
    }
}
