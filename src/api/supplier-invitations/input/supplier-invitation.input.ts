import { Field, InputType } from '@nestjs/graphql';
import { TeamInvitationInput } from 'api/team-invitations/inputs/team-invitation.input';

@InputType()
export class SupplierInvitationInput extends TeamInvitationInput {
    @Field({ nullable: true })
    supplierId?: string;

    @Field({ nullable: true })
    supplierName?: string;
}
