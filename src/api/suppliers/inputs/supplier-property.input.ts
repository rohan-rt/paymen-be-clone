import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class SupplierPropertyInput {
    @Field({ nullable: true })
    key?: string;

    @Field({ nullable: true })
    value?: string;
}
