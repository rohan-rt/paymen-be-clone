import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
// export class UserType extends mongoose.Document {
export class TwoFAResponseType {
    @Field({ nullable: true })
    secret?: string;
    @Field({ nullable: true })
    otpUrl?: string;

    constructor(secret: string, otpUrl: string) {
        this.secret = secret;
        this.otpUrl = otpUrl;
    }
}
