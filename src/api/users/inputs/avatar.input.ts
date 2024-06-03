import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class AvatarInput {
    @Field({ nullable: true })
    _id?: string; // UserId
    @Field({ nullable: true })
    base64Image?: string;
    @Field({ nullable: true })
    avatarBg?: string; // Background must not necessarily be present
}