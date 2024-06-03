import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';

// Import schemas
import { UserDocument } from 'api/users/schemas/user.schema';

@Schema()
export class CBy {
    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'User',
    })
    updatedBy: UserDocument;

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'User',
    })
    createdBy: UserDocument;
}
export type CByDocument = CBy & Document;
export const CBySchema = SchemaFactory.createForClass(CBy);
