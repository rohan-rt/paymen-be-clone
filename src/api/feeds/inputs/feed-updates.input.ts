import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class FeedUpdatesInput {

    @Field({ nullable: true })
    refId?: string;
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
