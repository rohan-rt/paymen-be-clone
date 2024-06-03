import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SessionResponseType {
    @Field(() => ID, { nullable: true })
    _id?: string;

    @Field({ nullable: true })
    device?: string;

    @Field({ nullable: true })
    location?: string;

    @Field({ nullable: true })
    current?: boolean;

    @Field({ nullable: true })
    createdAt?: Date;
}
