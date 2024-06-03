import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class InvoicesCountIDType {
    @Field({ nullable: true })
    status: string;
    @Field({ nullable: true })
    currency: string;
}

@ObjectType()
export class InvoicesCountsType {
    @Field(() => InvoicesCountIDType, { nullable: true })
    _id: InvoicesCountIDType;
    @Field({ nullable: true })
    status: string;
    @Field({ nullable: true })
    currency: string;
    @Field({ nullable: true })
    count: number;
    @Field({ nullable: true })
    amount: number;
    @Field({ nullable: true })
    suppliers: number;
    @Field(() => [String], { nullable: true })
    supplierIds: Array<string>;
    @Field({ nullable: true })
    daysLateMin: number;
    @Field({ nullable: true })
    daysLateMax: number;
}

@ObjectType()
export class InvoicesSummaryType {
    @Field(() => [InvoicesCountsType], { nullable: true })
    byStatus: InvoicesCountsType[];
    @Field(() => [InvoicesCountsType], { nullable: true })
    byDueDate?: InvoicesCountsType[];
    @Field(() => [InvoicesCountsType], { nullable: true })
    byNearDate?: InvoicesCountsType[];
}
