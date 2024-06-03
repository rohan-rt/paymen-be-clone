import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Import schemas
import { CCreated } from 'common/schemas/common-created.schema';
import { TeamDocument } from 'api/teams/schemas/team.schema';

// Import configs
import intervals from 'config/intervals.config';

export enum EnumEmailVerifType {
    USER = 'USER',
    NEW_TEAM = 'NEW_TEAM',
    TEAM = 'TEAM',
}

@Schema()
export class EmailVerification extends CCreated {
    @Prop({ type: String, required: false })
    token: string;

    @Prop({ type: String, required: false })
    email: string;

    @Prop({ type: String, required: false })
    newEmail: string;

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'Team',
    })
    team: TeamDocument;

    @Prop({
        type: String,
        enum: EnumEmailVerifType,
        required: false,
    })
    type: string;
}

export type EmailVerificationDocument = EmailVerification & Document;

export const EmailVerificationSchema = SchemaFactory.createForClass(EmailVerification);

EmailVerificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: intervals.DEL_EMAIL_VERIF });
