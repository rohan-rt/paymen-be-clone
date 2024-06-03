import { Args, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SessionAuthGuard } from 'common/guards/session.guard';
import { JwtAuthGuard } from 'common/guards/jwt.guard';

// Import services
import { AllInvitationsService } from './all-invitations.service';

// Import models
import { AllInvitationsType } from './models/all-invitations.model';

@Resolver()
export class AllInvitationsResolver {
    constructor(private allInvitationsService: AllInvitationsService) {}

    @Query((returns) => AllInvitationsType)
    @UseGuards(JwtAuthGuard)
    async getAllInvitations(@Args({ name: 'inviteeId' }) inviteeId: string) {
        return await this.allInvitationsService.getAllInvitations(inviteeId);
    }

    // inviteIds contains team
    @Query((returns) => AllInvitationsType)
    @UseGuards(JwtAuthGuard)
    async getMoreInviteResponses(
        @Args({ name: 'inviteeId' }) inviteeId: string,
        @Args('tirId', { nullable: true }) tirId?: string,
        @Args('sirId', { nullable: true }) sirId?: string,
    ) {
        // 'inviteeIds' should contain a TIR _id string and SIR _id string
        return await this.allInvitationsService.getMoreInviteResponses(inviteeId, tirId, sirId);
    }
}
