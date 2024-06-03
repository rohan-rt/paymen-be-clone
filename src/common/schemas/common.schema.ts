import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';

// Import schemas
import { UserDocument } from 'api/users/schemas/user.schema';

@Schema()
export class Common {
    @Prop({ type: Date, required: false })
    updatedAt: Date;

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'User',
    })
    updatedBy: UserDocument;

    @Prop({ type: Date, required: false })
    createdAt: Date;

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'User',
    })
    createdBy: UserDocument;
}
export type CommonDocument = Common & Document;
export const CommonSchema = SchemaFactory.createForClass(Common);
