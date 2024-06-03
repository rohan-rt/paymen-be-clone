import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Import configs
import intervals from 'config/intervals.config';

@Schema()
export class ForgotPassword {
    @Prop({ type: String, required: true })
    token: string;

    @Prop({ type: String, required: true })
    email: string;

    @Prop({ type: Date, required: true })
    updatedAt: Date;
}

export type ForgotPasswordDocument = ForgotPassword & Document;

export const ForgotPasswordSchema = SchemaFactory.createForClass(ForgotPassword);

ForgotPasswordSchema.index({ updatedAt: 1 }, { expireAfterSeconds: intervals.DEL_FORGOT_PASS });
