import { Field, ID, ObjectType } from '@nestjs/graphql';
import { UserType } from 'api/users/models/user.model';
import { TeamType } from 'api/teams/models/team.model';
import { CommonType } from 'common/models/common.model';

@ObjectType()
export class TeamInvitationType extends CommonType {
    @Field(() => ID, { nullable: true })
    _id?: string;

    @Field({ nullable: true })
    status?: string;

    @Field({ nullable: true })
    token?: string;

    @Field(() => TeamType, { nullable: true })
    team?: TeamType;

    @Field({ nullable: true })
    inviteeEmail?: string;

    @Field(() => UserType, { nullable: true })
    invitee?: UserType;

    @Field({ nullable: true })
    inviteeNewEmail?: string;

    @Field({ nullable: true })
    inviteeUpdatedAt?: Date;
}
