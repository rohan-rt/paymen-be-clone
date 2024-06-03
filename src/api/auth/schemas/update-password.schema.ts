import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Import configs
import intervals from 'config/intervals.config';

@Schema()
export class UpdatePassword {
    @Prop({ type: String, required: true })
    token: string;

    @Prop({ type: String, required: true })
    email: string;

    @Prop({ type: String, required: true })
    newPassword: string;

    @Prop({ type: Date, required: true })
    updatedAt: Date;
}

export type UpdatePasswordDocument = UpdatePassword & Document;

export const UpdatePasswordSchema = SchemaFactory.createForClass(UpdatePassword);

UpdatePasswordSchema.index({ updatedAt: 1 }, { expireAfterSeconds: intervals.DEL_UPDATE_PASS });
