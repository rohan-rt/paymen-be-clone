import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class FilterInput {
    @Field({ nullable: true })
    field?: string;

    @Field({ nullable: true })
    condition?: string;

    @Field({ nullable: true })
    value?: string;
}