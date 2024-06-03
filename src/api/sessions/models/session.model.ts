import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
class SessionUserType {
    @Field(() => ID, { nullable: true })
    userId?: string;

    @Field({ nullable: true })
    location?: string;

    @Field({ nullable: true })
    device?: string;
}

@ObjectType()
class PassportType {
    @Field(() => SessionUserType, { nullable: true })
    user?: SessionUserType;
}
@ObjectType()
class CookieType {
    @Field({ nullable: true })
    expires?: Date;

    @Field({ nullable: true })
    originalMaxAge?: number;
}

@ObjectType()
export class SessionPassportType {
    @Field(() => PassportType, { nullable: true })
    passport?: PassportType;

    @Field(() => CookieType, { nullable: true })
    cookie?: CookieType;
}

@ObjectType()
export class SessionType {
    // ! Passport generates a string and NOT objectID type for _id
    @Field({ nullable: true })
    _id?: string;

    @Field({ nullable: true })
    expires?: Date;

    @Field(() => SessionPassportType, { nullable: true })
    session?: SessionPassportType;
}
