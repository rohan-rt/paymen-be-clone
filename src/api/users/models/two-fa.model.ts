import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TwoFAType {
    @Field({ nullable: true })
    secret?: string;

    @Field({ nullable: true })
    isEnabled?: boolean;

    @Field({ nullable: true })
    resetCode?: string;

    @Field({ nullable: true })
    resetCreated?: Date;
}