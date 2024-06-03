import { Field, ObjectType } from '@nestjs/graphql';
import { UserType } from 'api/users/models/user.model';

// CommonType refers to ObjectType Common
@ObjectType()
export class CommonType {
    @Field({ nullable: true })
    createdAt?: Date;

    @Field(() => UserType, { nullable: true })
    createdBy?: UserType;

    @Field({ nullable: true })
    updatedAt?: Date;

    @Field(() => UserType, { nullable: true })
    updatedBy?: UserType;
}
