import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SessionAuthGuard } from 'common/guards/session.guard';
import { JwtAuthGuard } from 'common/guards/jwt.guard';

// Import services
import { MembersService } from './members.service';

// Import inputs
import { MemberInput } from '../members/inputs/member.input';

// Import models
import { MemberType } from './models/member.model';
import { MembersType } from './models/members.model';

@Resolver()
export class MembersResolver {
    constructor(private membersService: MembersService) {}

    @Query((returns) => MembersType)
    @UseGuards(JwtAuthGuard)
    async getTeamMemberById(@Args({ name: 'memberId' }) memberId: string) {
        try {
            return await this.membersService.getTeamMemberById(memberId);
        } catch (err) {
            throw err;
        }
    }

    @Query((returns) => MembersType)
    @UseGuards(JwtAuthGuard)
    async getAllTeamMembers(@Args({ name: 'teamId' }) teamId: string) {
        try {
            return await this.membersService.getAllTeamMembers(teamId);
        } catch (err) {
            throw err;
        }
    }

    @Query((returns) => MembersType)
    @UseGuards(JwtAuthGuard)
    async getAcceptedTeamMembers(@Args({ name: 'teamId' }) teamId: string) {
        try {
            return await this.membersService.getTeamMembers(teamId);
        } catch (err) {
            throw err;
        }
    }

    @Query((returns) => Number)
    @UseGuards(JwtAuthGuard)
    async getTeamMembersCount(@Args({ name: 'teamId' }) teamId: string) {
        try {
            return await this.membersService.getTeamMembersCount(teamId);
        } catch (err) {
            throw err;
        }
    }

    @Mutation((returns) => MemberType)
    @UseGuards(JwtAuthGuard)
    async addMember(@Args({ name: 'member' }) member: MemberInput) {
        try {
            return await this.membersService.addMember(member);
        } catch (err) {
            throw err;
        }
    }

    @Mutation((returns) => MembersType)
    @UseGuards(JwtAuthGuard)
    async changeMemberRole(
        @Args({ name: 'userId' }) userId: string,
        @Args({ name: 'memberId' }) memberId: string,
        @Args({ name: 'role' }) role: string,
    ) {
        try {
            return await this.membersService.changeMemberRole(userId, memberId, role);
        } catch (err) {
            throw err;
        }
    }

    @Mutation((returns) => MembersType)
    @UseGuards(JwtAuthGuard)
    async toggleMemberStatus(
        @Args({ name: 'userId' }) userId: string,
        @Args({ name: 'memberId' }) memberId: string,
    ) {
        try {
            return await this.membersService.toggleMemberStatus(userId, memberId);
        } catch (err) {
            throw err;
        }
    }

    @Mutation((returns) => MembersType)
    @UseGuards(JwtAuthGuard)
    async removeMember(@Args({ name: 'memberId' }) memberId: string) {
        try {
            return await this.membersService.removeMember(memberId, true);
        } catch (err) {
            throw err;
        }
    }
}
