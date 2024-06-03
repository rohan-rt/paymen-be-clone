import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class InvoicePrimaryInput {
    // Corresponding _id of object type below!
    @Field({ nullable: true })
    _id?: string;

    // type 0 = File Type
    // type 1 = Email Type
    // type 2 = Email Attachment Type
    @Field({ nullable: true })
    type?: number;
}
