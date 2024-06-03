import { Field, Int, InputType, ObjectType } from '@nestjs/graphql';
// import * as mongoose from 'mongoose';

@ObjectType()
// export class KeyDataFromMatchesType extends mongoose.Document {
export class KeyDataFromMatchesType {
    @Field(() => String)
    matchText: String;
    @Field(() => Number)
    matchIndex: Number;
}

@ObjectType()
// export class SpacyType extends mongoose.Document {
export class SpacyType {
    @Field(() => [Int])
    id: [Number];
    @Field(() => String)
    className: String;
    @Field(() => String)
    text: String;
    @Field(() => [KeyDataFromMatchesType])
    matches: [KeyDataFromMatchesType];
}
