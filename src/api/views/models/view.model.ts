import { Field, ID, ObjectType } from '@nestjs/graphql';
// import { CommonType } from 'common/models/common.model';
import { TeamType } from 'api/teams/models/team.model';
import { UserType } from 'api/users/models/user.model';
import { ColumnType } from 'api/views/models/column.model';
import { FilterType } from 'api/views/models/filter.model';
import { SortType } from 'api/views/models/sort.model';
import { GroupType } from 'api/views/models/group.model';

@ObjectType()
export class ViewType {
    @Field(() => ID, { nullable: true })
    _id?: string;
    @Field({ nullable: true })
    name?: string;
    @Field(() => TeamType, { nullable: true })
    team?: TeamType;
    @Field(() => UserType, { nullable: true })
    user?: UserType;
    @Field({ nullable: true })
    type?: string;
    @Field(() => [ColumnType], { nullable: true })
    columns?: Array<ColumnType>;
    @Field(() => [FilterType], { nullable: true })
    filters?: Array<FilterType>;
    @Field(() => [SortType], { nullable: true })
    sorts?: Array<SortType>;
    @Field(() => GroupType, { nullable: true })
    group?: GroupType;
}