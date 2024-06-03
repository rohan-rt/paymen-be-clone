import { Field, ObjectType } from '@nestjs/graphql';
import { UserType } from 'api/users/models/user.model';

@ObjectType()
export class CByType {
    @Field(() => UserType, { nullable: true })
    createdBy?: UserType;

    @Field(() => UserType, { nullable: true })
    updatedBy?: UserType;
}
