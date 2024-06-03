import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class EmailAcceptType {
    @Field({ nullable: true })
    message: string;

    @Field({ nullable: true })
    invoiceId?: string;
}
