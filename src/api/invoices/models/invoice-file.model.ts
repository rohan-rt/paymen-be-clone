import { Field, ObjectType } from '@nestjs/graphql';
import { FileType } from 'api/files/models/file.model';
import { EmailType } from 'api/emails/model/email.model';
import { EmailAttachmentType } from 'api/emails/model/email-attachment.model';

@ObjectType()
export class InvoiceFileType {
    @Field(() => FileType, { nullable: true })
    file?: FileType;

    @Field(() => EmailType, { nullable: true })
    email?: EmailType;

    @Field(() => EmailAttachmentType, { nullable: true })
    emailAttachment?: EmailAttachmentType;
}
