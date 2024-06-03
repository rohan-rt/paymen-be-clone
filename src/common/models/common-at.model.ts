import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CAtType {
    @Field({ nullable: true })
    createdAt?: Date;

    @Field({ nullable: true })
    updatedAt?: Date;
}
