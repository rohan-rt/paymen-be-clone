import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Import schemas
import { Common } from 'common/schemas/common.schema';

// Import models
import { SpacyType } from 'common/models/spacy.model';

@Schema()
export class File extends Common {
    @Prop({ type: String, required: false })
    name: string;

    @Prop({ type: String, required: false })
    html: string;

    @Prop({ type: String, required: false })
    file: string;

    @Prop({ type: Number, required: false })
    size: number;

    @Prop({ type: Boolean, required: false })
    isPrimary: boolean;

    // Contains percentage/likelihood of the file containing an invoice
    @Prop({ type: Number, required: false })
    isInvoice: number;

    @Prop({ type: String, required: false })
    text_C: string;

    @Prop({ type: SpacyType, required: false })
    textLabelled_C: Array<SpacyType>;
}

export type FileDocument = File & Document;

export const FileSchema = SchemaFactory.createForClass(File);
