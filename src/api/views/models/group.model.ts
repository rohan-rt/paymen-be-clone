import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class GroupType {
    @Field({ nullable: true })
    field?: string;

    @Field({ nullable: true })
    order?: string;

    @Field({ nullable: true })
    enabled?: boolean;
}