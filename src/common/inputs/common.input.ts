import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CommonInput {
    @Field({ nullable: true })
    createdBy?: string;

    @Field({ nullable: true })
    createdAt?: Date;

    @Field({ nullable: true })
    updatedBy?: string;

    @Field({ nullable: true })
    updatedAt?: Date;
}
