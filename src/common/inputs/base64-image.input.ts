import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class Base64ImageType {
    @Field({ nullable: true })
    base64Image: string;
}
