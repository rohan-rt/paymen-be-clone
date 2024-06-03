import { Args, Query, Resolver } from '@nestjs/graphql';
import { CurrencyService } from './currency.service';
import { CurrencyType } from './models/currency.model';

@Resolver()
export class CurrencyResolver {
    constructor(private readonly currencyService: CurrencyService) {}

    @Query(() => CurrencyType)
    async getCurrencyRates() {
        try {
            return this.currencyService.getBase();
        } catch (err) {
            throw err;
        }
    }
}
