import { Field, InputType } from '@nestjs/graphql';

// Import inputs
import { FileInput } from '../../files/inputs/files.input';
import { EmailInput } from 'api/emails/input/email.input';
import { EmailAttachmentInput } from 'api/emails/input/email-attachment.input';

@InputType()
export class InvoiceFileInput {
    // Used for Update Invoice
    @Field((type) => FileInput, { nullable: true })
    file?: FileInput;

    // Used for Submit Invoice in case of original file + trimmed file
    @Field((type) => [FileInput], { nullable: true })
    files?: Array<FileInput>;

    @Field((type) => EmailInput, { nullable: true })
    email?: EmailInput;

    @Field((type) => EmailAttachmentInput, { nullable: true })
    emailAttachment?: EmailAttachmentInput;
}
