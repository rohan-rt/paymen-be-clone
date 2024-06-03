import { Field, ObjectType, ID } from '@nestjs/graphql';

// Import models
import { UserType } from 'api/users/models/user.model';
import { TeamType } from 'api/teams/models/team.model';
import { PortalType } from 'api/portals/models/portal.model';
import { EmailPartsType } from './email-parts.model';
import { CommonType } from 'common/models/common.model';
import { EmailAttachmentType } from './email-attachment.model';
import { InvoiceType } from 'api/invoices/models/invoice.model';
import { EmailFileType } from './email-file.model';
import { FileType } from 'api/files/models/file.model';

@ObjectType()
export class EmailType extends CommonType {
    @Field(() => ID, { nullable: true })
    _id?: string;

    @Field(() => EmailPartsType, { nullable: true })
    from?: EmailPartsType;

    @Field(() => [EmailPartsType], { nullable: true })
    to?: Array<EmailPartsType>;

    @Field(() => [EmailPartsType], { nullable: true })
    cc?: Array<EmailPartsType>;

    @Field({ nullable: true })
    subject?: string;

    @Field({ nullable: true })
    date?: Date;

    @Field(() => FileType, { nullable: true })
    body?: FileType;

    @Field(() => EmailFileType, { nullable: true })
    eml?: EmailFileType;

    @Field({ nullable: true })
    status?: string;

    @Field(() => [EmailAttachmentType], { nullable: true })
    attachments?: Array<EmailAttachmentType>;

    @Field(() => TeamType, { nullable: true })
    team?: TeamType;

    @Field(() => PortalType, { nullable: true })
    portal?: PortalType;

    @Field({ nullable: true })
    invoiceType?: string;

    @Field(() => InvoiceType, { nullable: true })
    invoice?: InvoiceType;

    @Field({ nullable: true })
    linkedAt?: Date;

    @Field(() => UserType, { nullable: true })
    linkedBy?: UserType;

    @Field({ nullable: true })
    treated?: boolean;
}
