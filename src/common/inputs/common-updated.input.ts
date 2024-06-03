import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CUpdatedInput {
    @Field({ nullable: true })
    updatedAt?: Date;

    @Field({ nullable: true })
    updatedBy?: string;
}
