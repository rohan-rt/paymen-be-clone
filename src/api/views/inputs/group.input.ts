import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class GroupInput {
    @Field({ nullable: true })
    field?: string;

    @Field({ nullable: true })
    order?: string;

    @Field({ nullable: true })
    enabled?: boolean;
}