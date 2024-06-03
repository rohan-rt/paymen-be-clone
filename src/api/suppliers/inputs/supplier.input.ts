import { Field, InputType } from '@nestjs/graphql';
import { TeamInput } from 'api/teams/inputs/team.input';
import { SupplierSettingsInput } from './supplier-settings.input';
import { SupplierPropertiesInput } from './supplier-properties.input';
import { MemberInput } from 'api/members/inputs/member.input';

@InputType()
export class SupplierInput extends TeamInput {
    @Field({ nullable: true })
    team?: string;

    @Field({ nullable: true })
    invitation?: string;

    @Field({ nullable: true })
    supplier?: string;

    @Field(() => [SupplierSettingsInput], { nullable: true })
    settings?: Array<SupplierSettingsInput>;

    @Field(() => [SupplierPropertiesInput], { nullable: true })
    properties?: Array<SupplierPropertiesInput>;

    @Field({ nullable: true })
    sendInvite?: boolean;

    @Field(() => [MemberInput], { nullable: true })
    subscribers?: Array<MemberInput>;
}
