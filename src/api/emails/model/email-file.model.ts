import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class EmailFileType {
    @Field({ nullable: true })
    file?: string;
    @Field({ nullable: true })
    size?: number;
}
