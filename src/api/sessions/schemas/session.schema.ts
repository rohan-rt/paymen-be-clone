import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SessionType } from '../models/session.model';
import { Document } from 'mongoose';

@Schema()
export class Session {
    // ! Passport generates a string and NOT objectID type for _id
    @Prop({ type: String, required: false })
    _id: string;

    // @Prop({ type: Date, required: false })
    // expires: Date;

    @Prop({ type: SessionType, required: false })
    session: SessionType;
}

export type SessionDocument = Session & Document;

export const SessionSchema = SchemaFactory.createForClass(Session);
