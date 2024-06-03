import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SessionAuthGuard } from 'common/guards/session.guard';
import { JwtAuthGuard } from 'common/guards/jwt.guard';

// Import inputs
import { TeamInput } from './inputs/team.input';

// Import models
import { EmailVerificationType } from 'api/email-verifications/models/email-verification.model';
import { UserType } from 'api/users/models/user.model';
import { TeamType } from './models/team.model';
import { Base64ImageType } from 'common/inputs/base64-image.input';

// Import services
import { TeamsService } from './teams.service';

@Resolver()
export class TeamsResolver {
    constructor(private teamsService: TeamsService) {}

    @Query((returns) => TeamType)
    @UseGuards(JwtAuthGuard)
    async getTeamById(@Args({ name: 'teamId' }) teamId: string) {
        try {
            return await this.teamsService.getTeamById(teamId);
        } catch (err) {
            throw err;
        }
    }

    @Query((returns) => UserType)
    @UseGuards(JwtAuthGuard)
    async getTeamsByUserId(@Args({ name: 'userId' }) userId: string) {
        return await this.teamsService.getTeamsByUserId(userId);
    }

    @Mutation((returns) => UserType)
    @UseGuards(JwtAuthGuard)
    async createTeam(@Args({ name: 'newTeam' }) newTeam: TeamInput) {
        return await this.teamsService.createTeam(newTeam);
    }

    @Mutation((returns) => String)
    @UseGuards(JwtAuthGuard)
    async verifyTeamEmail(
        @Args({ name: 'token' }) token: string,
        @Args({ name: 'userId' }) userId: string,
    ) {
        return await this.teamsService.verifyTeamEmail(token, userId);
    }

    @Mutation((returns) => String)
    @UseGuards(JwtAuthGuard)
    async selectTeam(
        @Args({ name: 'userId' }) userId: string,
        @Args({ name: 'teamId' }) teamId: string,
    ) {
        return await this.teamsService.selectTeam(userId, teamId);
    }

    @Query((returns) => EmailVerificationType)
    @UseGuards(JwtAuthGuard)
    async getTeamEmailVerification(@Args({ name: 'teamId' }) teamId: string) {
        return await this.teamsService.getTeamEmailVerification(teamId);
    }

    @Mutation((returns) => EmailVerificationType)
    @UseGuards(JwtAuthGuard)
    async resendTeamVerification(
        @Args({ name: 'team' }) team: TeamInput,
        @Args({ name: 'userId' }) userId: string,
        @Args({ name: 'type' }) type: string,
        @Args({ name: 'newEmail' }) newEmail?: string,
    ) {
        return await this.teamsService.createAndSendEmailVerification(team, userId, type, newEmail);
    }

    @Mutation((returns) => UserType)
    @UseGuards(JwtAuthGuard)
    async updateTeam(
        @Args({ name: 'team' }) team: TeamInput,
        @Args({ name: 'userId' }) userId: string,
    ) {
        return await this.teamsService.updateTeam(team, userId);
    }

    @Mutation((returns) => UserType)
    @UseGuards(JwtAuthGuard)
    async leaveTeam(
        @Args({ name: 'teamId' }) teamId: string,
        @Args({ name: 'userId' }) userId: string,
    ) {
        return await this.teamsService.leaveTeam(teamId, userId);
    }

    @Mutation((returns) => UserType)
    @UseGuards(JwtAuthGuard)
    async deleteTeamById(
        @Args({ name: 'teamId' }) teamId: string,
        @Args({ name: 'userId' }) userId: string,
    ) {
        return await this.teamsService.deleteTeam(teamId, userId);
    }

    @Mutation((returns) => UserType)
    @UseGuards(JwtAuthGuard)
    async reinstateTeam(
        @Args({ name: 'teamId' }) teamId: string,
        @Args({ name: 'userId' }) userId: string,
    ) {
        return await this.teamsService.reinstateTeam(teamId, userId);
    }

    @Mutation((returns) => String)
    @UseGuards(JwtAuthGuard)
    async uploadLogo(
        @Args({ name: 'userId' }) userId: string,
        @Args({ name: 'teamId' }) teamId: string,
        @Args({ name: 'base64Image' }) base64Image: Base64ImageType,
    ) {
        return await this.teamsService.uploadLogo(userId, teamId, base64Image.base64Image);
    }

    @Mutation((returns) => String)
    @UseGuards(JwtAuthGuard)
    async deleteLogo(
        @Args({ name: 'teamId' }) teamId: string,
        @Args({ name: 'userId' }) userId: string,
    ) {
        return await this.teamsService.deleteLogo(teamId, userId);
    }
}
