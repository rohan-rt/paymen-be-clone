import { Field, InputType } from '@nestjs/graphql';
import { PhoneInput } from 'common/inputs/phone.input';
import { AddressInput } from 'common/inputs/address.input';
import { CommonInput } from 'common/inputs/common.input';

@InputType()
export class TeamInput extends CommonInput {
    @Field({ nullable: true })
    _id?: string;
    @Field({ nullable: true })
    name?: string;
    @Field({ nullable: true })
    email?: string;
    @Field({ nullable: true })
    taxId?: string;
    @Field((type) => PhoneInput, { nullable: true })
    phone?: PhoneInput;
    @Field((type) => AddressInput, { nullable: true })
    address?: AddressInput;
    @Field({ nullable: true })
    website?: string;
    @Field({ nullable: true })
    timeZone?: string;
    @Field({ nullable: true })
    currency?: string;
    @Field({ nullable: true })
    status?: string;
    @Field({ nullable: true })
    logoBg?: string;
}
