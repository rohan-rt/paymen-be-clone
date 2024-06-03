import { Field, ObjectType } from '@nestjs/graphql';
import { UserType } from 'api/users/models/user.model';

@ObjectType()
export class CCreatedType {
    @Field({ nullable: true })
    createdAt?: Date;

    @Field(() => UserType, { nullable: true })
    createdBy?: UserType;
}
