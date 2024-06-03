import { Field, ID, ObjectType } from '@nestjs/graphql';
import { TeamType } from 'api/teams/models/team.model';
import { UserType } from 'api/users/models/user.model';
import { CAtType } from 'common/models/common-at.model';

@ObjectType()
export class MemberType extends CAtType {
    @Field(() => ID, { nullable: true })
    _id?: string;
    @Field({ nullable: true })
    role?: string;
    @Field({ nullable: true })
    status?: string;
    @Field(() => TeamType, { nullable: true })
    team?: TeamType;
    @Field(() => UserType, { nullable: true })
    user?: UserType;

    // Can't import CommonType due to circular reference issue
    // Below complements CAtType
    @Field(() => UserType, { nullable: true })
    createdBy?: UserType;
    @Field(() => UserType, { nullable: true })
    updatedBy?: UserType;
}
