import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class EmailPartsType {
    @Field({ nullable: true })
    name?: string;
    @Field({ nullable: true })
    email?: string;
}
