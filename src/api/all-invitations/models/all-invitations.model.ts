import { Field, ID, ObjectType } from '@nestjs/graphql';

import { TeamInvitationType } from 'api/team-invitations/models/team-invitation.model';
import { SupplierInvitationType } from 'api/supplier-invitations/models/supplier-invitation.model';
import { NotificationType } from 'api/notifications/models/notification.model';

@ObjectType()
export class AllInvitationsType {
    @Field(() => [TeamInvitationType], { nullable: true })
    teamInvites?: Array<TeamInvitationType>;

    @Field(() => [SupplierInvitationType], { nullable: true })
    supplierInvites?: Array<SupplierInvitationType>;

    @Field(() => [NotificationType], { nullable: true })
    teamInviteResponses?: Array<NotificationType>;

    @Field(() => [NotificationType], { nullable: true })
    supplierInviteResponses?: Array<NotificationType>;

    constructor(
        teamInvites?: TeamInvitationType[],
        supplierInvites?: SupplierInvitationType[],
        teamInviteResponses?: NotificationType[],
        supplierInviteResponses?: NotificationType[],
    ) {
        this.teamInvites = teamInvites;
        this.supplierInvites = supplierInvites;
        this.teamInviteResponses = teamInviteResponses;
        this.supplierInviteResponses = supplierInviteResponses;
    }
}
