import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Import schemas
import { CCreated } from 'common/schemas/common-created.schema';

// Import configs
import keys from 'config/keys.config';

export enum EnumDownloadType {
    FILE = 'FILE',
    EMAIL_BODY = 'EMAIL_BODY',
    EMAIL_EML = 'EMAIL_EML',
    EMAIL_ATT = 'EMAIL_ATT',
}

@Schema()
export class Download extends CCreated {
    @Prop({ type: String, required: true })
    file: string;

    @Prop({
        type: String,
        required: true,
        enum: EnumDownloadType,
    })
    type: string;

    @Prop({
        type: Number,
        required: true,
        default: 0,
    })
    count: number;
}

export type DownloadDocument = Download & Document;

export const DownloadSchema = SchemaFactory.createForClass(Download);

DownloadSchema.index({ createdAt: 1 }, { expireAfterSeconds: keys.MONGO.DOWNLOAD.TTL });
