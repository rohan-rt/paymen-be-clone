import { Field, ID, ObjectType } from '@nestjs/graphql';

// Import models
import { CAtType } from 'common/models/common-at.model';
import { PhoneType } from 'common/models/phone.model';
import { AddressType } from 'common/models/address.model';
import { UserType } from 'api/users/models/user.model';

@ObjectType()
export class TeamType extends CAtType {
    @Field(() => ID, { nullable: true })
    _id?: string;
    @Field({ nullable: true })
    name?: string;
    @Field({ nullable: true })
    status?: string;
    @Field({ nullable: true })
    logoBg?: string;
    @Field({ nullable: true })
    email?: string;
    @Field({ nullable: true })
    taxId?: string;
    @Field(() => PhoneType, { nullable: true })
    phone?: PhoneType;
    @Field(() => AddressType, { nullable: true })
    address?: AddressType;
    @Field({ nullable: true })
    website?: string;
    @Field({ nullable: true })
    timeZone?: string;
    @Field({ nullable: true })
    currency?: string;

    // Can't import CommonType due to circular reference issue
    // Below complements CAtType
    @Field(() => UserType, { nullable: true })
    createdBy?: UserType;
    @Field(() => UserType, { nullable: true })
    updatedBy?: UserType;
}
