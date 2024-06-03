import { Field, InputType, ObjectType } from '@nestjs/graphql';

@InputType()
export class AddressInput {
    @Field({ nullable: true })
    field1?: string;
    @Field({ nullable: true })
    field2?: string;
    @Field({ nullable: true })
    country?: string;
    @Field({ nullable: true })
    city?: string;
    @Field({ nullable: true })
    postalCode?: string;
}
