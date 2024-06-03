import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class ActiveViewsInput {
    @Field({ nullable: true })
    invoicesIn?: string;

    @Field({ nullable: true })
    invoicesOut?: string;

    @Field({ nullable: true })
    suppliers?: string;

    @Field({ nullable: true })
    clients?: string;

    @Field({ nullable: true })
    emails?: string;
}