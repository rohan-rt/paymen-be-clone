import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SupplierPropertyType {
    @Field({ nullable: true })
    key?: string;

    @Field({ nullable: true })
    value?: string;
}
