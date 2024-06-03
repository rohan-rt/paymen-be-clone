import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class ChangePasswordInput {
    @Field({ nullable: true })
    _id: string;

    @Field({ nullable: true })
    currentPassword: string;

    @Field({ nullable: true })
    newPassword: string;

    @Field({ nullable: true })
    confirmNewPassword: string;

    @Field({ nullable: true })
    twoFAToken: string;
}
