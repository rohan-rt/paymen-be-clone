import { Field, ObjectType } from '@nestjs/graphql';
import { PortalType } from 'api/portals/models/portal.model';
import { SupplierPropertyType } from './supplier-property.model';

@ObjectType()
export class SupplierPropertiesType {
    @Field(() => PortalType, { nullable: true })
    portal?: PortalType;

    // Don't use InvoiceType!
    @Field({ nullable: true })
    invoiceType?: string;

    @Field({ nullable: true })
    category?: string;

    @Field({ nullable: true })
    type?: string;

    @Field(() => SupplierPropertyType, { nullable: true })
    property?: SupplierPropertyType;
}
