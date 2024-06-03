import { InputType, Field } from '@nestjs/graphql';
import { CUpdatedInput } from 'common/inputs/common-updated.input';
import { SpacyInput } from 'common/inputs/spacy.input';

@InputType()
export class EmailAttachmentInput extends CUpdatedInput {
    @Field({ nullable: true })
    _id?: string;

    @Field({ nullable: true })
    name?: string;

    // emailId of the parent email
    @Field({ nullable: true })
    email?: string;

    // Contains percentage/likelihood of the email attachments containing an invoice
    @Field({ nullable: true })
    isInvoice?: number;

    @Field({ nullable: true })
    isPrimary?: boolean;

    @Field({ nullable: true })
    text_C?: string;

    @Field((type) => [SpacyInput], { nullable: true })
    textLabelled_C?: Array<SpacyInput>;
}
