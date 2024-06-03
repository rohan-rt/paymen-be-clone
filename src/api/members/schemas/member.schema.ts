import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';

// Import schemas
import { Common } from 'common/schemas/common.schema';
import { TeamDocument } from 'api/teams/schemas/team.schema';
import { UserDocument } from 'api/users/schemas/user.schema';

export enum EnumMemberStatus {
    PENDING = 'PENDING',
    ACTIVE = 'ACTIVE',
    DEACTIVATED = 'DEACTIVATED',
}

export enum EnumMemberRole {
    OWNER = 'OWNER',
    MEMBER = 'MEMBER',
    // APPROVER = 'APPROVER',
}

@Schema()
export class Member extends Common {
    @Prop({
        type: String,
        enum: EnumMemberRole,
        default: EnumMemberRole.MEMBER,
        required: true,
    })
    role: string;

    @Prop({
        type: String,
        enum: EnumMemberStatus,
        default: EnumMemberStatus.PENDING,
        required: true,
    })
    status: string;

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Team',
    })
    team: TeamDocument;

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    })
    user: UserDocument;
}

export type MemberDocument = Member & Document;

export const MemberSchema = SchemaFactory.createForClass(Member);
