import { Field, ObjectType } from '@nestjs/graphql';
import { TeamInvitationType } from 'api/team-invitations/models/team-invitation.model';
import { MemberType } from './member.model';

@ObjectType()
export class MembersType {
    @Field(() => [MemberType], { nullable: true })
    members?: [MemberType];
    @Field(() => [TeamInvitationType], { nullable: true })
    invitees?: [TeamInvitationType];
}
