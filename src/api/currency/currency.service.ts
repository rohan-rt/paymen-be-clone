import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/mongoose';

// Import configs
import config from 'config';

// Import schemas
import { CurrencyDocument } from './schemas/currency.schema';

const base = config.keys.CURRENCY.symbol;
const refresh = config.intervals.REFRESH_CURRENCY_RATES;

@Injectable()
export class CurrencyService {
    constructor(
        @InjectModel('Currency') private currencyModel: Model<CurrencyDocument>,
        private readonly httpService: HttpService,
    ) {}

    async ensureBase() {
        const res = await this.getBase();
        const isRecent = Date.now() - res?.updatedAt.getTime() < refresh;
        if (res && isRecent) return 'CURRENCY.EXISTS';
        else await this.updateBase();
        return 'CURRENCY.UPDATED';
    }

    async getBase(): Promise<CurrencyDocument> {
        try {
            return await this.currencyModel.findOne({ base });
        } catch (error) {
            throw error;
        }
    }

    async updateBase(): Promise<CurrencyDocument> {
        try {
            const data = await this.getRates(base);
            const { rates, date, timestamp } = data;
            const updatedAt = new Date();
            return await this.currencyModel.findOneAndUpdate(
                { base },
                { rates, date, timestamp, updatedAt },
                { new: true, upsert: true },
            );
        } catch (error) {
            throw error;
        }
    }

    async getRates(sym: string): Promise<any> {
        const url = config.keys.CURRENCY.uri + sym;
        const headers = { 'apikey': config.keys.CURRENCY.apikey, 'Accept-Encoding': '*' };
        const res = await this.httpService.get(url, { headers }).toPromise();
        return res.data;
    }
}
