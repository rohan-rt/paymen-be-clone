import { Field, InputType } from '@nestjs/graphql';
import { SupplierPropertyInput } from './supplier-property.input';

@InputType()
export class SupplierPropertiesInput {
    @Field({ nullable: true })
    portal?: string;

    @Field({ nullable: true })
    invoiceType?: string;

    @Field({ nullable: true })
    category?: string;

    @Field({ nullable: true })
    type?: string;

    @Field(() => SupplierPropertyInput, { nullable: true })
    property?: SupplierPropertyInput;
}
