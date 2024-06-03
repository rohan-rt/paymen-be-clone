import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Import schemas
import { Common } from 'common/schemas/common.schema';

// Import models
import { AddressType } from 'common/models/address.model';
import { PhoneType } from 'common/models/phone.model';

export enum EnumTeamStatus {
    UNDER_VERIF = 'UNDER_VERIFICATION',
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    DELETED = 'DELETED',
}

@Schema()
export class Team extends Common {
    @Prop({ type: String, required: false })
    name: string;
    @Prop({ type: String, required: false })
    email: string;
    @Prop({ type: String, required: false })
    taxId: string;
    @Prop({ type: PhoneType, required: false })
    phone: PhoneType;
    @Prop({ type: AddressType, required: false })
    address: AddressType;
    @Prop({ type: String, required: false })
    website: string;
    @Prop({
        type: String,
        enum: EnumTeamStatus,
        required: false,
    })
    status: string;
    @Prop({ type: String, required: false })
    timeZone: string;
    @Prop({ type: String, required: false })
    currency: string;
    @Prop({ type: String, required: false })
    logoBg: string;
}

export type TeamDocument = Team & Document;

export const TeamSchema = SchemaFactory.createForClass(Team);
