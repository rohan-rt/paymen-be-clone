import { Args, Int, Mutation, Parent, Query, ResolveProperty, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SessionAuthGuard } from 'common/guards/session.guard';
import { JwtAuthGuard } from 'common/guards/jwt.guard';

// Import inputs
import { UserInput } from './inputs/user.input';
import { AvatarInput } from './inputs/avatar.input';
import { ActiveViewsInput } from './inputs/active-views.input';
import { ChangePasswordInput } from 'api/auth/inputs/change-password.input';

// Import services
import { UsersService } from './users.service';

// Import models
import { UserType } from './models/user.model';
import { UserResponseType } from './models/user-response.model';
import { EmailVerificationType } from 'api/email-verifications/models/email-verification.model';

@Resolver()
export class UsersResolver {
    constructor(private userService: UsersService) {}

    @Query((returns) => UserType)
    @UseGuards(JwtAuthGuard)
    async getUserById(@Args({ name: 'userId' }) userId: string) {
        return await this.userService.getUserById(userId);
    }

    @Query((returns) => UserType, { nullable: true })
    @UseGuards(JwtAuthGuard)
    async getUserByEmail(@Args({ name: 'email' }) email: string) {
        return await this.userService.getUserByEmail(email);
    }

    @Query((returns) => UserType)
    @UseGuards(JwtAuthGuard)
    async getViewsById(@Args({ name: 'userId' }) userId: string) {
        return await this.userService.getUserById(userId);
    }

    @Mutation((returns) => UserResponseType)
    @UseGuards(JwtAuthGuard)
    async updateUser(@Args({ name: 'user' }) user: UserInput) {
        return await this.userService.updateUser(user);
    }

    @Mutation((returns) => UserResponseType)
    @UseGuards(JwtAuthGuard)
    async updateUserEmail(
        @Args({ name: 'email' }) email: string,
        @Args({ name: 'newEmail' }) newEmail: string,
    ) {
        return await this.userService.updateUserEmail(email, newEmail);
    }

    @Query((returns) => EmailVerificationType)
    @UseGuards(JwtAuthGuard)
    async getUserEmailVerification(@Args({ name: 'email' }) email: string) {
        return await this.userService.getEmailVerification(email);
    }

    @Mutation((returns) => UserResponseType)
    @UseGuards(JwtAuthGuard)
    async verifyUserNewEmail(@Args({ name: 'token' }) token: string) {
        return await this.userService.verifyNewEmail(token);
    }

    @Mutation((returns) => String)
    @UseGuards(JwtAuthGuard)
    async deleteUserNewEmail(@Args({ name: 'token' }) token: string) {
        return await this.userService.deleteNewEmail(token);
    }

    @Mutation((returns) => UserResponseType)
    @UseGuards(JwtAuthGuard)
    async updateUserAvatar(@Args({ name: 'avInput' }) avInput: AvatarInput) {
        return await this.userService.updateUserAvatar(avInput);
    }

    @Mutation((returns) => UserResponseType)
    @UseGuards(JwtAuthGuard)
    async deleteUserAvatar(@Args({ name: 'avInput' }) avInput: AvatarInput) {
        return await this.userService.deleteUserAvatar(avInput);
    }

    @Mutation((returns) => String)
    @UseGuards(JwtAuthGuard)
    async changeUserPassword(
        @Args({ name: 'changePassword' }) changePassword: ChangePasswordInput,
    ) {
        return await this.userService.changePassword(changePassword);
    }

    @Mutation((returns) => UserType)
    @UseGuards(JwtAuthGuard)
    async setActiveViews(
        @Args({ name: 'userId' }) userId: string,
        @Args({ name: 'views' }) views: ActiveViewsInput,
    ) {
        return await this.userService.setActiveViews(userId, views);
    }

    @Mutation((returns) => UserType)
    @UseGuards(JwtAuthGuard)
    async addFavView(
        @Args({ name: 'userId' }) userId: string,
        @Args({ name: 'viewId' }) viewId: string,
    ) {
        return await this.userService.addFavView(userId, viewId);
    }

    @Mutation((returns) => UserType)
    @UseGuards(JwtAuthGuard)
    async removeFavView(
        @Args({ name: 'userId' }) userId: string,
        @Args({ name: 'viewId' }) viewId: string,
    ) {
        return await this.userService.removeFavView(userId, viewId);
    }

    // @Mutation((returns) => String)
    // @UseGuards(JwtAuthGuard)
    // async deleteUserById(@Args({ name: 'userId' }) userId: string) {
    //     return await this.userService.deleteUserById(userId);
    // }
}
