import { Field, Int, InputType, ObjectType } from '@nestjs/graphql';

@InputType()
export class KeyDataFromMatchesInput {
    @Field(() => String)
    matchText: String;
    @Field(() => Int)
    matchIndex: Number;
}

@InputType()
export class SpacyInput {
    @Field(() => [Int])
    id: [Number];
    @Field(() => String)
    className: String;
    @Field(() => String)
    text: String;
    @Field(() => [KeyDataFromMatchesInput])
    matches: [KeyDataFromMatchesInput];
}
