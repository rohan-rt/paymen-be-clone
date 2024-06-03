import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class FeedUpdatesType {
    @Field({ nullable: true })
    refId?: string; // if we need to link it to a specific document
    @Field({ nullable: true })
    name?: string;

    @Field(() => [String], { nullable: true })
    previousArr?: Array<String>;
    @Field(() => [String], { nullable: true })
    newArr?: Array<String>;

    @Field({ nullable: true })
    parentField?: string;
    @Field({ nullable: true })
    field?: string;

    @Field({ nullable: true })
    prevValue?: string; // Previous value
    @Field({ nullable: true })
    newValue?: string; // New updated value



}
