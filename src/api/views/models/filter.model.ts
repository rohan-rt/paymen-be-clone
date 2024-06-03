import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class FilterType {
    @Field({ nullable: true })
    field?: string;

    @Field({ nullable: true })
    condition?: string;

    @Field({ nullable: true })
    value?: string;
}