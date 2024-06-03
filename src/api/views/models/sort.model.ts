import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SortType {
    @Field({ nullable: true })
    field?: string;

    @Field({ nullable: true })
    condition?: string;
}