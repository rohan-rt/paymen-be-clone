import { Field, ObjectType } from '@nestjs/graphql';

// CommonType refers to ObjectType Common
@ObjectType()
export class RelatedMembersType {
    @Field({ nullable: true })
    _id?: string;

    @Field({ nullable: true })
    firstName?: string;

    @Field({ nullable: true })
    lastName?: string;

    @Field({ nullable: true })
    type?: string;
}
