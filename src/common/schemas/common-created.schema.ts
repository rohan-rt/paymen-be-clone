import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';

// Import schemas
import { UserDocument } from 'api/users/schemas/user.schema';

@Schema()
export class CCreated {
    @Prop({ type: Date, required: false })
    createdAt: Date;

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'User',
    })
    createdBy: UserDocument;
}
export type CCreatedDocument = CCreated & Document;
export const CCreatedSchema = SchemaFactory.createForClass(CCreated);
