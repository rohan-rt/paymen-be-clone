import { Field, ID, ObjectType } from '@nestjs/graphql';

import { PortalType } from 'api/portals/models/portal.model';

@ObjectType()
export class SupplierSettingsType {
    @Field(() => PortalType, { nullable: true })
    portal?: PortalType;

    // Don't use InvoiceType!
    @Field(() => [String], { nullable: true })
    invoiceTypes?: Array<string>;
}
