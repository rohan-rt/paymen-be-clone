import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class EmailsInput {
    @Field(() => [String], { nullable: true })
    emailIds?: Array<string>;

    @Field({ nullable: true })
    supplierId?: string;

    @Field({ nullable: true })
    portalId?: string;

    @Field({ nullable: true })
    userId?: string;

    @Field({ nullable: true })
    teamId?: string;

    @Field({ nullable: true })
    invoiceTypeId?: string;

    @Field({ nullable: true })
    invoiceId?: string;

    @Field({ nullable: true })
    status?: string;

    // If emails are to be linked, provide linkedAt + userId for linkedBy
    @Field({ nullable: true })
    linkedAt?: Date;

    @Field({ nullable: true })
    treated?: boolean;
}
