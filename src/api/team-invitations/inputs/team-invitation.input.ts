import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class TeamInvitationInput {
    @Field({ nullable: true })
    _id?: string; // Invite Id

    @Field({ nullable: true })
    invitorId?: string; // the user who sent the invite

    @Field({ nullable: true })
    teamId?: string; // the team where the invite is done

    @Field({ nullable: true })
    inviteeEmail?: string; // the destination

    @Field({ nullable: true })
    inviteeNewEmail?: string;

    @Field({ nullable: true })
    inviteeUpdatedAt?: Date;

    @Field({ nullable: true })
    inviteeId?: string; // the user who receives the invite

    @Field({ nullable: true })
    token?: string;

    @Field({ nullable: true })
    status?: string;
}
