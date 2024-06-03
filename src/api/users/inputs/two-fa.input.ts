import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class TwoFAInput {
    @Field({ nullable: true })
    secret?: string;

    @Field({ nullable: true })
    isEnabled?: boolean;

    @Field({ nullable: true })
    resetCode?: string;

    @Field({ nullable: true })
    resetCreated?: Date;
}
