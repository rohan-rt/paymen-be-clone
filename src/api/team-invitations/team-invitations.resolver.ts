import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SessionAuthGuard } from 'common/guards/session.guard';
import { JwtAuthGuard } from 'common/guards/jwt.guard';

// Import services
import { EmailService } from 'services/emails/email.service';
import { MembersService } from 'api/members/members.service';
import { TeamInvitationsService } from './team-invitations.service';

// Import inputs
import { TeamInvitationInput } from './inputs/team-invitation.input';

// Import models
import { MembersType } from 'api/members/models/members.model';
import { TeamInvitationType } from './models/team-invitation.model';
import { InviteResponseType } from 'common/models/invite-response.model';

@Resolver()
export class InvitationsResolver {
    constructor(
        private teamInvitationsService: TeamInvitationsService,
        private readonly emailService: EmailService,
        private readonly membersService: MembersService,
    ) {}

    @Query((returns) => TeamInvitationType)
    // @UseGuards(JwtAuthGuard)
    // ! Don't enable guard; should be possible to call without being logged in.
    // ! Token param serves as a safety measure
    async getTeamInvitationByToken(@Args({ name: 'token' }) token: string) {
        const res = await this.teamInvitationsService.getTeamInvitationByToken(token);
        return res ? res : {};
    }

    @Query((returns) => [TeamInvitationType])
    @UseGuards(JwtAuthGuard)
    async getTeamInvitations(@Args({ name: 'teamId' }) teamId: string) {
        return await this.teamInvitationsService.getTeamInvitations(teamId);
    }

    @Mutation((returns) => MembersType)
    @UseGuards(JwtAuthGuard)
    async sendTeamInvitations(
        @Args({ name: 'invite' }) invite: TeamInvitationInput,
        @Args({ name: 'emails', type: () => [String] }) emails: string[],
    ) {
        return await this.teamInvitationsService.sendTeamInvitations(invite, emails);
    }

    @Mutation((returns) => MembersType)
    @UseGuards(JwtAuthGuard)
    async resendTeamInvitation(
        @Args({ name: 'inviteId' }) inviteId: string,
        @Args({ name: 'reinvitorId' }) reinvitorId: string,
    ) {
        const exists = await this.teamInvitationsService.getTeamInvitationById(inviteId);
        if (!exists) throw 'RESEND_TEAM_INVITE.INVALID_INVITE';
        const res = await this.teamInvitationsService.resendTeamInvitation(exists, reinvitorId);
        return await this.membersService.getAllTeamMembers(res.team._id);
    }

    // Mostly when the invitee signs up with another email address
    @Mutation((returns) => TeamInvitationType)
    // ! Don't use Guard here as we need it during signUp
    // ! invite input contains token parameter for security
    // @UseGuards(JwtAuthGuard)
    async updateTeamInvitation(@Args({ name: 'invite' }) invite: TeamInvitationInput) {
        const exists = await this.teamInvitationsService.getTeamInvitationByToken(invite.token);
        if (!exists) throw 'UPDATE_TEAM_INVITE.INVALID_INVITE';
        return await this.teamInvitationsService.updateTeamInvitation(invite);
    }

    // Revoke team invitation by id (+ return remaining invites of the involved team)
    @Mutation((returns) => MembersType)
    @UseGuards(JwtAuthGuard)
    async revokeTeamInvitation(@Args({ name: 'inviteId' }) inviteId: string) {
        const exists = await this.teamInvitationsService.getTeamInvitationById(inviteId);
        if (!exists) throw 'REVOKE_TEAM_INVITE.INVALID_INVITE';
        await this.teamInvitationsService.revokeTeamInvitation(inviteId);
        return await this.membersService.getAllTeamMembers(exists.team._id);
    }

    @Mutation((returns) => InviteResponseType)
    @UseGuards(JwtAuthGuard)
    async acceptTeamInvite(@Args({ name: 'token' }) token: string) {
        return await this.teamInvitationsService.acceptTeamInvite(token);
    }

    @Mutation((returns) => InviteResponseType)
    @UseGuards(JwtAuthGuard)
    async declineTeamInvite(@Args({ name: 'token' }) token: string) {
        return await this.teamInvitationsService.declineTeamInvite(token);
    }
}
