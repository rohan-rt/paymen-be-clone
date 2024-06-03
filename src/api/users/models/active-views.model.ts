import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ActiveViewsType {
    @Field({ nullable: true })
    invoicesIn?: string;

    @Field({ nullable: true })
    invoicesOut?: string;

    @Field({ nullable: true })
    suppliers?: string;

    @Field({ nullable: true })
    clients?: string;

    @Field({ nullable: true })
    emails?: string;
}