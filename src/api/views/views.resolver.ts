import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SessionAuthGuard } from 'common/guards/session.guard';
import { JwtAuthGuard } from 'common/guards/jwt.guard';

// Import inputs
import { ViewInput } from './inputs/view.input';

// Import models
import { ViewType } from './models/view.model';

// Import services
import { ViewsService } from './views.service';

@Resolver()
export class ViewsResolver {
    constructor(private viewsService: ViewsService) {}

    @Query((returns) => [ViewType])
    @UseGuards(JwtAuthGuard)
    async getViewsByTeam(@Args({ name: 'teamId' }) teamId: string) {
        return await this.viewsService.getViewsByTeam(teamId);
    }

    @Query((returns) => [ViewType])
    @UseGuards(JwtAuthGuard)
    async getViewsByUser(@Args({ name: 'userId' }) userId: string) {
        return await this.viewsService.getViewsByUser(userId);
    }

    @Mutation((returns) => ViewType)
    @UseGuards(JwtAuthGuard)
    async createView(@Args({ name: 'newView' }) newView: ViewInput) {
        return await this.viewsService.createView(newView);
    }

    @Mutation((returns) => String)
    @UseGuards(JwtAuthGuard)
    async deleteViewById(@Args({ name: 'viewId' }) viewId: string) {
        return await this.viewsService.deleteViewById(viewId);
    }

    @Mutation((returns) => ViewType)
    @UseGuards(JwtAuthGuard)
    async updateView(@Args({ name: 'view' }) view: ViewInput) {
        return await this.viewsService.updateView(view);
    }
}
