import { Field, InputType } from '@nestjs/graphql';
import { CAtInput } from 'common/inputs/common-at.input';
import { PhoneInput } from 'common/inputs/phone.input';
import { TwoFAInput } from './two-fa.input';

@InputType()
export class UserInput extends CAtInput {
    @Field({ nullable: true })
    _id?: string;

    @Field({ nullable: true })
    socketId?: string;

    @Field({ nullable: true })
    firstName?: string;

    @Field({ nullable: true })
    lastName?: string;

    @Field({ nullable: true })
    email?: string;

    @Field(() => PhoneInput, { nullable: true })
    phone?: PhoneInput;

    @Field({ nullable: true })
    password?: string;

    @Field(() => [String], { nullable: true })
    roles?: Array<string>;

    @Field({ nullable: true })
    avatarBg?: string;

    @Field({ nullable: true })
    timeZone?: string;

    @Field({ nullable: true })
    drawer?: boolean;

    @Field(() => TwoFAInput, { nullable: true })
    twoFA?: TwoFAInput;
}
