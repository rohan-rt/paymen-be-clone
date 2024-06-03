import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ColumnType {
    @Field({ nullable: true })
    name?: string;

    @Field({ nullable: true })
    width?: string;
}