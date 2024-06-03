import { Field, InputType } from '@nestjs/graphql';

import { CommonInput } from 'common/inputs/common.input';
import { SpacyInput } from 'common/inputs/spacy.input';

@InputType()
export class FileInput extends CommonInput {
    @Field({ nullable: true })
    _id?: string;

    @Field({ nullable: true })
    name?: string;

    @Field({ nullable: true })
    isPrimary?: boolean;

    @Field({ nullable: true })
    isInvoice?: number;

    @Field({ nullable: true })
    size?: number;

    // Returns the base64 encoded file string (in DataURL format)
    @Field({ nullable: true })
    file?: string;

    @Field({ nullable: true })
    text_C?: string;

    @Field((type) => [SpacyInput], { nullable: true })
    textLabelled_C?: Array<SpacyInput>;

    @Field({ nullable: true })
    teamId?: string;

    @Field({ nullable: true })
    invoiceId?: string;
}
