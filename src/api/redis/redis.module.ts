import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

// Import services
import { RedisService } from './redis.service';
import { BackblazeService } from 'services/backblaze/backblaze.service';

// Import resolvers and modules
import { RedisController } from './redis.controller';

@Module({
    imports: [HttpModule],
    controllers: [RedisController],
    providers: [RedisService, BackblazeService],
    exports: [RedisService],
})
export class RedisDBModule implements NestModule {
    public configure(consumer: MiddlewareConsumer) {
        // consumer.apply(LoggerMiddleware).forRoutes(RedisController);
    }
}
