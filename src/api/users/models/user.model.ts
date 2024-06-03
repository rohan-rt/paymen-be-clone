import { Field, ID, ObjectType } from '@nestjs/graphql';

// Import models
import { CAtType } from 'common/models/common-at.model';
import { PhoneType } from 'common/models/phone.model';
import { MemberType } from 'api/members/models/member.model';
import { TeamType } from 'api/teams/models/team.model';
import { ActiveViewsType } from 'api/users/models/active-views.model';
import { TwoFAType } from 'api/users/models/two-fa.model';

@ObjectType()
export class UserType extends CAtType {
    // ! Neven include password or TwoFA or any type of other sensitive data

    @Field(() => ID, { nullable: true })
    _id?: string;

    @Field({ nullable: true })
    socketId?: string;
    @Field({ nullable: true })
    lastName?: string;
    @Field({ nullable: true })
    firstName?: string;
    @Field({ nullable: true })
    email?: string;
    @Field({ nullable: true })
    emailVerified?: boolean;
    @Field(() => TwoFAType, { nullable: true })
    twoFA?: TwoFAType;
    @Field(() => PhoneType, { nullable: true })
    phone?: PhoneType;
    @Field({ nullable: true })
    avatarBg?: string;
    @Field({ nullable: true })
    timeZone?: string;
    @Field({ nullable: true })
    drawer?: boolean;

    @Field(() => TeamType, { nullable: true })
    lastSelectedTeam?: TeamType;
    @Field(() => [MemberType], { nullable: true })
    myTeams?: Array<MemberType>;

    @Field(() => ActiveViewsType, { nullable: true })
    activeViews?: ActiveViewsType;
    @Field(() => [String], { nullable: true })
    favViews?: Array<string>;

    @Field({ nullable: true })
    isSecure?: boolean;
}
