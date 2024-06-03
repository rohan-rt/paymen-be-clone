import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';

// import { Common } from 'common/schemas/common.schema';
import { TeamDocument } from 'api/teams/schemas/team.schema';
import { UserDocument } from 'api/users/schemas/user.schema';

import { ColumnType } from 'api/views/models/column.model';
import { FilterType } from 'api/views/models/filter.model';
import { SortType } from 'api/views/models/sort.model';
import { GroupType } from 'api/views/models/group.model';

export enum EnumViewType {
    INVOICES_IN = 'INVOICES-IN',
    INVOICES_OUT = 'INVOICES-OUT',
    SUPPLIERS = 'SUPPLIERS',
    CLIENTS = 'CLIENTS',
    EMAILS = 'EMAILS',
}

@Schema()
export class View {
    @Prop({ type: String, required: false })
    name: string;

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        default: undefined,
        ref: 'Team',
    })
    team: TeamDocument;

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        default: undefined,
        ref: 'User',
    })
    user: UserDocument;

    @Prop({ type: String, enum: EnumViewType, required: false })
    type: string;

    @Prop({
        type: ColumnType,
        required: false,
        default: [],
    })
    columns: Array<ColumnType>;

    @Prop({
        type: FilterType,
        required: false,
        default: [],
    })
    filters: Array<FilterType>;

    @Prop({
        type: SortType,
        required: false,
        default: [],
    })
    sorts: Array<SortType>;

    @Prop({
        type: GroupType,
        required: false,
        default: {},
    })
    group: GroupType;
}

export type ViewDocument = View & Document;

export const ViewSchema = SchemaFactory.createForClass(View);
