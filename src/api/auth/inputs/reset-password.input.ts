import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class ResetPasswordInput {
    @Field({ nullable: true })
    newPassword: string;
    @Field({ nullable: true })
    confirmNewPassword: string;
}