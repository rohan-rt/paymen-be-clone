import { Field, ID, ObjectType } from '@nestjs/graphql';

// Import models
import { CCreatedType } from 'common/models/common-created.model';

@ObjectType()
export class DownloadType extends CCreatedType {
    @Field(() => ID, { nullable: true })
    _id?: string;

    @Field({ nullable: true })
    file?: string;

    @Field({ nullable: true })
    type?: string;

    @Field({ nullable: true })
    count?: number;
}
