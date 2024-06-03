import { Field, InputType } from '@nestjs/graphql';
import { CommonInput } from 'common/inputs/common.input';
@InputType()
export class MemberInput extends CommonInput {
    @Field({ nullable: true })
    team?: string;
    // This refers to the new member's user _id
    @Field({ nullable: true })
    user?: string;
    @Field({ nullable: true })
    status?: string;
    @Field({ nullable: true })
    role?: string;
}
