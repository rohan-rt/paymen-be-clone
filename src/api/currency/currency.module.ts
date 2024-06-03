import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';

// Import schemas
import { CurrencySchema } from './schemas/currency.schema';

// Import services
import { CurrencyService } from './currency.service';

// Import resolvers
import { CurrencyResolver } from './currency.resolver';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: 'Currency', schema: CurrencySchema }]),
        HttpModule,
    ],
    providers: [CurrencyResolver, CurrencyService],
    exports: [CurrencyService],
})
export class CurrencyModule implements NestModule {
    public configure(consumer: MiddlewareConsumer) {}
}
