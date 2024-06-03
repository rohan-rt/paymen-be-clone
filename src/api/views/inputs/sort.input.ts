import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class SortInput {
    @Field({ nullable: true })
    field?: string;

    @Field({ nullable: true })
    condition?: string;
}