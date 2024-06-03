import { Field, ObjectType } from '@nestjs/graphql';
import { RatesType } from './rates.model';

@ObjectType()
export class CurrencyType {
    @Field({ nullable: true })
    base?: string;

    @Field({ nullable: true })
    date?: Date;

    @Field(() => RatesType, { nullable: true })
    rates?: RatesType;

    @Field({ nullable: true })
    timestamp?: number;

    @Field({ nullable: true })
    updatedAt?: Date;
}
