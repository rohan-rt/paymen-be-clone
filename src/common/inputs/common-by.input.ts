import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CByInput {
    @Field({ nullable: true })
    createdBy?: string;

    @Field({ nullable: true })
    updatedBy?: string;
}
