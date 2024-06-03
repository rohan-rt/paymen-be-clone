import { Field, ID, ObjectType } from '@nestjs/graphql';
import { UserType } from 'api/users/models/user.model';

@ObjectType()
// export class UserType extends mongoose.Document {
export class AuthResponseType {
    @Field({ nullable: true })
    message?: string;
    @Field(() => UserType, { nullable: true })
    user?: UserType;
    @Field({ nullable: true })
    token?: string;

    constructor(message?: string, user?: UserType, token?: string) {
        this.message = message;
        this.user = user;
        this.token = token;
    }
}
