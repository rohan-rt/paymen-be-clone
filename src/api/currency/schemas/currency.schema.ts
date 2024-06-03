import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { RatesType } from '../models/rates.model';
import { CUpdated } from 'common/schemas/common-updated.schema';

@Schema()
export class Currency extends CUpdated {
    @Prop({ type: String, required: false })
    base: string;

    @Prop({ type: Date, required: false })
    date: Date;

    @Prop({ type: RatesType, required: false })
    rates: RatesType;

    @Prop({ type: Number, required: false })
    timestamp: number;
}

export type CurrencyDocument = Currency & Document;

export const CurrencySchema = SchemaFactory.createForClass(Currency);
