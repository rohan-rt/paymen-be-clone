import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class CAt {
    @Prop({ type: Date, required: false })
    createdAt: Date;

    @Prop({ type: Date, required: false })
    updatedAt: Date;
}
export type CAtDocument = CAt & Document;
export const CAtSchema = SchemaFactory.createForClass(CAt);
