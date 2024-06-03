import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class DeleteSessions {
    @Prop({ type: String, required: true })
    token: string;

    @Prop({ type: String, required: true })
    email: string;

    @Prop({ type: Date, required: true })
    updatedAt: Date;
}

export type DeleteSessionsDocument = DeleteSessions & Document;

export const DeleteSessionsSchema = SchemaFactory.createForClass(DeleteSessions);
