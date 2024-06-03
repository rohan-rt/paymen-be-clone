import { Field, ObjectType } from '@nestjs/graphql';
import { NotificationType } from 'api/notifications/models/notification.model';

@ObjectType()
export class InviteResponseType {
    @Field({ nullable: true })
    message: string;
    @Field(() => NotificationType, { nullable: true })
    notification?: NotificationType;

    constructor(message: string, notification?: NotificationType) {
        this.message = message;
        this.notification = notification;
    }
}
