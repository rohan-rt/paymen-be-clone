import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class InvoiceTemplateType {
    @Field({ nullable: true })
    _id?: string;
    @Field({ nullable: true })
    name?: string;
    @Field({ nullable: true })
    type?: string;
    @Field(() => [InvoiceTemplateStructureType], { nullable: true })
    structure?: [InvoiceTemplateStructureType];
}

@ObjectType()
export class InvoiceTemplateStructureType {
    @Field({ nullable: true })
    _id?: string;
    @Field({ nullable: true })
    id?: string;
    @Field({ nullable: true })
    type?: string;
    @Field({ nullable: true })
    item?: string;
    @Field({ nullable: true })
    sysMandatory?: boolean;
    @Field({ nullable: true })
    formType?: string;
    @Field(() => [String], { nullable: true })
    rules?: Array<string>;
    @Field(() => [String], { nullable: true })
    selectionItems?: Array<string>;
    @Field({ nullable: true })
    minLength?: number;
    @Field({ nullable: true })
    maxLength?: number;
}
