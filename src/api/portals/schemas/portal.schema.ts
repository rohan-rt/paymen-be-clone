import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';

// Import schemas
import { Common } from 'common/schemas/common.schema';
import { TeamDocument } from 'api/teams/schemas/team.schema';

// Import models
import { InvoiceTypeType } from '../models/invoice-type.model';
import { UserType } from 'api/users/models/user.model';
import { MemberType } from 'api/members/models/member.model';

export enum EnumPortalStatus {
    ACTIVE = 'ACTIVE',
    DISABLED = 'DISABLED',
    DELETED = 'DELETED',
}

@Schema()
export class Portal extends Common {
    @Prop({ type: String, required: false })
    name: string;

    @Prop({ type: String, required: false })
    prefix: string;

    @Prop({
        type: String,
        enum: EnumPortalStatus,
        required: false,
    })
    status: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, required: false, ref: 'Team' })
    team: TeamDocument;

    // 1 -- invoiceType have their own _id too!
    //      These cannot make use of the .populate() function though!
    // 2 -- invoiceTypes have a status as well.
    //      Same enum of portal status to be used!
    @Prop({ type: InvoiceTypeType, required: false, default: undefined }) // Avoid empty arrays being saved with this
    invoiceTypes: Array<InvoiceTypeType>;

    @Prop({
        type: MemberType,
        required: false,
        default: undefined,
    })
    subscribers: Array<MemberType>;
}

export type PortalDocument = Portal & Document;

export const PortalSchema = SchemaFactory.createForClass(Portal);

PortalSchema.index({ prefix: 1 }, { unique: true, sparse: true });
