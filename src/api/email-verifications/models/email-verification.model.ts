import { Field, ID, ObjectType } from '@nestjs/graphql';
import { TeamType } from 'api/teams/models/team.model';
import { CCreatedType } from 'common/models/common-created.model';

@ObjectType()
export class EmailVerificationType extends CCreatedType {
    @Field(() => ID, { nullable: true })
    _id?: string;

    @Field({ nullable: true })
    type?: string;

    @Field({ nullable: true })
    token?: string;

    @Field({ nullable: true })
    email?: string;

    @Field({ nullable: true })
    newEmail?: string;

    @Field(() => TeamType, { nullable: true })
    team?: TeamType;
}
