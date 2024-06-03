import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';

// Import schemas
import { UserDocument } from 'api/users/schemas/user.schema';

@Schema()
export class CUpdated {
    @Prop({ type: Date, required: false })
    updatedAt: Date;

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'User',
    })
    updatedBy: UserDocument;
}
export type CUpdatedDocument = CUpdated & Document;
export const CUpdatedSchema = SchemaFactory.createForClass(CUpdated);
