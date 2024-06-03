import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Interfaces
import { PhoneType } from 'common/models/phone.model';

// Schemas
import { CAt } from 'common/schemas/common-at.schema';
import { TeamDocument } from 'api/teams/schemas/team.schema';
import { ActiveViewsType } from 'api/users/models/active-views.model';
import { TwoFAType } from 'api/users/models/two-fa.model';

@Schema()
export class User extends CAt {
    @Prop({ type: String, required: false })
    lastName: string;
    @Prop({ type: String, required: false })
    firstName: string;
    @Prop({ type: String, required: false })
    email: string;
    @Prop({ type: PhoneType, required: false })
    phone: PhoneType;
    @Prop({ type: String, required: false })
    password: string;
    @Prop({ type: String, required: false })
    avatarBg: string;
    @Prop({ type: Boolean, required: false })
    emailVerified: boolean;

    @Prop({ type: [String], required: false, default: undefined }) // Avoid empty arrays being saved with this
    roles: Array<string>;
    @Prop({ type: String, required: false })
    socketId: string;
    @Prop({ type: String, required: false })
    timeZone: string;
    @Prop({ type: Boolean, required: false })
    drawer: boolean;
    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: false,
    })
    lastSelectedTeam: TeamDocument;

    @Prop({ type: ActiveViewsType, required: false })
    activeViews: ActiveViewsType;
    @Prop({ type: [String], required: false, default: [] })
    favViews: Array<string>;

    @Prop({ type: TwoFAType, required: false, default: {} })
    twoFA: TwoFAType;
    @Prop({ type: Boolean, required: false, default: true })
    isSecure: boolean;
}

export type UserDocument = User & Document;

export const UserSchema = SchemaFactory.createForClass(User);
