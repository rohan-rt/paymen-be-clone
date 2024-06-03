import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CCreatedInput {
    @Field({ nullable: true })
    createdAt?: Date;

    @Field({ nullable: true })
    createdBy?: string;
}
