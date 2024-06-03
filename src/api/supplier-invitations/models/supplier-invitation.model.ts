import { Field, ID, ObjectType } from '@nestjs/graphql';
import { SupplierType } from 'api/suppliers/models/supplier.model';
import { TeamInvitationType } from 'api/team-invitations/models/team-invitation.model';

@ObjectType()
export class SupplierInvitationType extends TeamInvitationType {
    // Invitee's selected team
    @Field(() => SupplierType, { nullable: true })
    supplier?: SupplierType;
}
