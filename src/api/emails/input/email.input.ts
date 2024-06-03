import { InputType, Field } from '@nestjs/graphql';
import { CUpdatedInput } from 'common/inputs/common-updated.input';
import { FileInput } from 'api/files/inputs/files.input';
import { EmailPartsType } from '../model/email-parts.model';
import { EmailPartsInput } from './email-parts-type.input';

@InputType()
export class EmailInput extends CUpdatedInput {
    @Field({ nullable: true })
    _id?: string;

    @Field({ nullable: true })
    name?: string;

    @Field({ nullable: true })
    subject?: string;

    @Field(() => EmailPartsInput, { nullable: true })
    from?: EmailPartsInput;

    @Field(() => FileInput, { nullable: true })
    body?: FileInput;

    @Field({ nullable: true })
    status?: string;

    @Field({ nullable: true })
    teamId?: string;

    @Field({ nullable: true })
    linkedAt?: Date;

    @Field({ nullable: true })
    linkedBy?: string;

    @Field({ nullable: true })
    treated?: boolean;
}
