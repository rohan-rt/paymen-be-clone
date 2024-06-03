import * as mongoose from 'mongoose';
import { Field, InputType, ObjectType } from '@nestjs/graphql';

@InputType()
export class PhoneInput {
    @Field({ nullable: true })
    number?: string;
    @Field({ nullable: true })
    country?: string;
}
