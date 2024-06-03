import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PhoneType {
    @Field({ nullable: true })
    number?: string;
    @Field({ nullable: true })
    country?: string;
}
