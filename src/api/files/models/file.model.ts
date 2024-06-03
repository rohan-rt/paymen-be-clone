import { Field, ID, ObjectType } from '@nestjs/graphql';

// Import models
import { CommonType } from 'common/models/common.model';
import { SpacyType } from 'common/models/spacy.model';

@ObjectType()
export class FileType extends CommonType {
    @Field(() => ID, { nullable: true })
    _id?: string;

    @Field({ nullable: true })
    name?: string;

    @Field({ nullable: true })
    html?: string;

    @Field({ nullable: true })
    file?: string;

    @Field({ nullable: true })
    size?: number;

    @Field({ nullable: true })
    isInvoice?: number;

    @Field({ nullable: true })
    isPrimary?: boolean;

    @Field({ nullable: true })
    text_C?: string;

    @Field(() => [SpacyType], { nullable: true })
    textLabelled_C?: Array<SpacyType>;
}
