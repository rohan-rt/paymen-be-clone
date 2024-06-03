import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class DownloadInput {
    @Field({ nullable: true })
    fileId?: string;
    @Field({ nullable: true })
    userId?: string;
    @Field({ nullable: true })
    type?: string;
}
