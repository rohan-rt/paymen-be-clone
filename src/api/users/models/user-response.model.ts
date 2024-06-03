import { Field, ID, ObjectType } from '@nestjs/graphql';
import { EmailVerificationType } from 'api/email-verifications/models/email-verification.model';
import { UserType } from './user.model';

@ObjectType()
// export class UserType extends mongoose.Document {
export class UserResponseType {
    @Field({ nullable: true })
    message?: string;
    @Field(() => UserType, { nullable: true })
    user?: UserType;
    @Field(() => EmailVerificationType, { nullable: true })
    emailVerification?: EmailVerificationType;

    constructor(message?: string, user?: UserType, emailVerification?: EmailVerificationType) {
        this.message = message;
        this.user = user;
        this.emailVerification = emailVerification;
    }
}
