import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SessionAuthGuard } from 'common/guards/session.guard';
import { JwtAuthGuard } from 'common/guards/jwt.guard';

// Import services
import { SupplierInvitationsService } from './supplier-invitations.service';

// Import inputs
import { SupplierInvitationInput } from './input/supplier-invitation.input';

// Import types
import { SupplierInvitationType } from './models/supplier-invitation.model';
import { SupplierType } from 'api/suppliers/models/supplier.model';
import { InviteResponseType } from 'common/models/invite-response.model';

@Resolver()
export class SupplierInvitationsResolver {
    constructor(private supplierInvitationsService: SupplierInvitationsService) {}

    @Query((returns) => SupplierInvitationType)
    // @UseGuards(JwtAuthGuard)
    // ! Don't enable guard; should be possible to call without being logged in.
    // ! Token param serves as a safety measure
    async getSupplierInviteByToken(@Args({ name: 'token' }) token: string) {
        const res = await this.supplierInvitationsService.getSupplierInviteByToken(token);
        return res || {};
    }

    @Query((returns) => [SupplierInvitationType])
    @UseGuards(JwtAuthGuard)
    async getSupplierInvites(@Args({ name: 'teamId' }) teamId: string) {
        const res = await this.supplierInvitationsService.getSupplierInvites(teamId);
        return res || {};
    }

    @Mutation((returns) => SupplierType)
    @UseGuards(JwtAuthGuard)
    async sendSupplierInvite(
        @Args({ name: 'supplierInvite' }) supplierInvite: SupplierInvitationInput,
    ) {
        return await this.supplierInvitationsService.sendSupplierInvite(supplierInvite);
    }

    @Mutation((returns) => SupplierType)
    @UseGuards(JwtAuthGuard)
    async resendSupplierInvite(
        @Args({ name: 'supplierInvite' }) supplierInvite: SupplierInvitationInput,
    ) {
        // Only by 'token' and not via '_id' of invite!
        return await this.supplierInvitationsService.resendSupplierInvite(supplierInvite);
    }

    // Invitee-initiated update
    @Mutation((returns) => SupplierInvitationType)
    // ! Don't use Guard here as we need it during signUp
    // ! invite input contains token parameter for security
    // @UseGuards(JwtAuthGuard)
    async updateSupplierInvite(@Args({ name: 'invite' }) invite: SupplierInvitationInput) {
        const res = await this.supplierInvitationsService.getSupplierInviteByToken(invite.token);
        if (!res) return null; // No team invitation found to resend
        return await this.supplierInvitationsService.updateSupplierInvite(invite);
    }

    // Revoke supplier invitation by id (+ return remaining invites of the involved team)
    @Mutation((returns) => SupplierType)
    @UseGuards(JwtAuthGuard)
    async revokeSupplierInvite(
        @Args({ name: 'token' }) token: string,
        @Args({ name: 'userId' }) userId: string,
        @Args({ name: 'teamId' }) teamId: string,
    ) {
        return await this.supplierInvitationsService.revokeSupplierInvite(token, userId, teamId);
    }

    // Revoke supplier invitation by supplierId (+ return remaining invites of the involved team)
    @Mutation((returns) => SupplierType)
    @UseGuards(JwtAuthGuard)
    async toggleSupplierInvite(
        @Args({ name: 'supplierId' }) supplierId: string,
        @Args({ name: 'userId' }) userId: string,
        @Args({ name: 'teamId' }) teamId: string,
    ) {
        return await this.supplierInvitationsService.toggleSupplierInvite(
            supplierId,
            userId,
            teamId,
        );
    }

    @Mutation((returns) => InviteResponseType)
    @UseGuards(JwtAuthGuard)
    async acceptSupplierInvite(
        @Args({ name: 'token' }) token: string,
        @Args({ name: 'teamId' }) teamId: string,
    ) {
        return await this.supplierInvitationsService.acceptSupplierInvite(token, teamId);
    }

    @Mutation((returns) => InviteResponseType)
    @UseGuards(JwtAuthGuard)
    async declineSupplierInvite(@Args({ name: 'token' }) token: string) {
        return await this.supplierInvitationsService.declineSupplierInvite(token);
    }
}
