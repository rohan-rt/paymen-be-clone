import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';

// Import schemas
import { Common } from 'common/schemas/common.schema';
import { UserDocument } from 'api/users/schemas/user.schema';
import { TeamDocument } from 'api/teams/schemas/team.schema';

export enum EnumTeamInviteStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    DECLINED = 'DECLINED',
}

@Schema()
export class TeamInvitation extends Common {
    @Prop({ type: String, required: true })
    token: string;

    @Prop({
        type: String,
        enum: EnumTeamInviteStatus,
        default: EnumTeamInviteStatus.PENDING,
        required: true,
    })
    status: string;

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Team',
    })
    team: TeamDocument;

    @Prop({ type: String, required: true })
    inviteeEmail: string;

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'User',
    })
    invitee: UserDocument;

    @Prop({ type: String, required: false })
    inviteeNewEmail: string;

    @Prop({ type: Date, required: false })
    inviteeUpdatedAt: Date;
}

export type TeamInvitationDocument = TeamInvitation & Document;

export const TeamInvitationSchema = SchemaFactory.createForClass(TeamInvitation);
