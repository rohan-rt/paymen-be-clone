import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class SupplierSettingsInput {
    @Field({ nullable: true })
    portal?: string;

    // Don't use InvoiceType!
    @Field(() => [String], { nullable: true })
    invoiceTypes?: Array<string>;
}
