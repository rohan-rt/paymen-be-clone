import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CAtInput {
    @Field({ nullable: true })
    createdAt?: Date;

    @Field({ nullable: true })
    updatedAt?: Date;
}
