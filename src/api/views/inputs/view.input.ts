import { Field, InputType } from '@nestjs/graphql';
// import { CommonInput } from 'common/inputs/common.input';

import { ColumnInput } from "api/views/inputs/column.input";
import { FilterInput } from "api/views/inputs/filter.input";
import { SortInput } from "api/views/inputs/sort.input";
import { GroupInput } from "api/views/inputs/group.input";

@InputType()
export class ViewInput {
    @Field({ nullable: true })
    _id?: string;
    @Field({ nullable: true })
    name?: string;
    @Field({ nullable: true })
    team?: string;
    @Field({ nullable: true })
    user?: string;
    @Field({ nullable: true })
    type?: string; // 'INVOICE' || 'USER' || 'EMAIL'
    @Field(() => [ColumnInput], { nullable: true })
    columns?: Array<ColumnInput>;
    @Field(() => [FilterInput], { nullable: true })
    filters?: Array<FilterInput>;
    @Field(() => [SortInput], { nullable: true })
    sorts?: Array<SortInput>;
    @Field(() => GroupInput, { nullable: true })
    group?: GroupInput;
}