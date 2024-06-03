import { Field, ObjectType } from '@nestjs/graphql';
import { UserType } from 'api/users/models/user.model';
import { CUpdatedType } from 'common/models/common-updated.model';

@ObjectType()
export class NotifiedUsersType extends CUpdatedType {
    @Field(() => UserType, { nullable: true })
    user?: UserType;
    @Field({ nullable: true })
    seen?: boolean;
}
