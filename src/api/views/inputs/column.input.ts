import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class ColumnInput {
    @Field({ nullable: true })
    name?: string;

    @Field({ nullable: true })
    width?: string;
}