import { Field, ObjectType } from '@nestjs/graphql';
import { UserType } from 'api/users/models/user.model';

@ObjectType()
export class CUpdatedType {
    @Field({ nullable: true })
    updatedAt?: Date;

    @Field(() => UserType, { nullable: true })
    updatedBy?: UserType;
}
