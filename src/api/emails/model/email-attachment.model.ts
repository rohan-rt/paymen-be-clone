import { Field, ObjectType, ID } from '@nestjs/graphql';

// Import models
import { EmailType } from './email.model';
import { SpacyType } from 'common/models/spacy.model';
import { CommonType } from 'common/models/common.model';

@ObjectType()
export class EmailAttachmentType extends CommonType {
    @Field(() => ID, { nullable: true })
    _id?: string;

    @Field({ nullable: true })
    name?: string;

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

    @Field(() => EmailType, { nullable: true })
    email?: EmailType;
}
