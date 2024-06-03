import { Args, Context, Query, Mutation, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

// Import guards
import { GQLAuthGuard } from 'common/guards/gql.guard';
import { LocalAuthGuard } from 'common/guards/local.guard';
import { SessionAuthGuard } from 'common/guards/session.guard';
import { JwtAuthGuard } from 'common/guards/jwt.guard';

// Import services
import { SessionsService } from 'api/sessions/sessions.service';
import { AuthService } from './auth.service';
import { UsersService } from 'api/users/users.service';

// Import inputs
import { UserInput } from 'api/users/inputs/user.input';
import { ResetPasswordInput } from './inputs/reset-password.input';

// Import models
import { AuthResponseType } from './models/auth-response.model';
import { SessionResponseType } from '../sessions/models/session-response.model';
import { TwoFAResponseType } from './models/twoFA-response.model';

@Resolver()
export class AuthResolver {
    constructor(
        private authService: AuthService,
        private userService: UsersService,
        private sessionsService: SessionsService,
    ) {}

    @Mutation((returns) => AuthResponseType)
    @UseGuards(GQLAuthGuard, LocalAuthGuard)
    async signIn(
        @Context() { req }: any,
        @Args({ name: 'email' }) email: string,
        @Args({ name: 'password' }) password: string,
        @Args({ name: 'location' }) location?: string,
        @Args('twoFAToken', { nullable: true }) twoFAToken?: string,
    ) {
        try {
            // ! Must use 'user' here. Cannot use other attribute name.
            // ! req.user is actually an AuthResponseType including 'message' and 'user' (without token!)
            // ! Token-attribute is set below before returning it back with message LOGIN.SUCCESS
            return this.authService.setAuthResponse(req.user.user, req.sessionID);
        } catch (err) {
            throw err;
        }
    }

    @Query((returns) => AuthResponseType)
    @UseGuards(SessionAuthGuard)
    async signInWithCred(@Context() { req }: any) {
        try {
            // ! See remarks above under 'SignIn' for req.user
            return this.authService.setAuthResponse(req.user, req.sessionID);
        } catch (err) {
            throw err;
        }
    }

    @Mutation((returns) => String)
    // @UseGuards(SessionAuthGuard) // ! Don't use Session or Jwt guards here to prevent infinite loop
    signOut(@Context() { req }: any) {
        try {
            return this.authService.logout(req);
        } catch (err) {
            throw err;
        }
    }

    // ----------------------------------------------------------------------------
    // Sessions
    // ----------------------------------------------------------------------------
    @Query((returns) => [SessionResponseType])
    @UseGuards(JwtAuthGuard)
    async getAllSessions(@Context() { req }: any) {
        return await this.sessionsService.getAllSessionResponses(req.user._id, req.sessionID);
    }

    @Mutation((returns) => String)
    @UseGuards(JwtAuthGuard)
    async revokeSession(
        @Context() { req }: any,
        @Args({ name: 'sessionId' }) sessionId: string,
        @Args({ name: 'password' }) password: string,
        @Args('twoFAToken', { nullable: true }) twoFAToken?: string,
    ) {
        try {
            return await this.sessionsService.revokeSession(req, sessionId, password, twoFAToken);
        } catch (err) {
            throw err;
        }
    }

    @Mutation((returns) => String)
    @UseGuards(JwtAuthGuard)
    async revokeAllSessions(
        @Context() { req }: any,
        @Args({ name: 'password' }) password: string,
        @Args('twoFAToken', { nullable: true }) twoFAToken?: string,
    ) {
        try {
            return await this.sessionsService.revokeAllSessions(req, password, twoFAToken);
        } catch (err) {
            throw err;
        }
    }

    @Mutation((returns) => String)
    // ! No guards needed. Is triggered via alert email
    async deleteAllSessions(@Context() { req }: any, @Args({ name: 'token' }) token: string) {
        try {
            return await this.sessionsService.deleteAllSessions(req, token);
        } catch (err) {
            throw err;
        }
    }

    // ----------------------------------------------------------------------------
    // Two-FA
    // ----------------------------------------------------------------------------

    @Mutation((returns) => TwoFAResponseType)
    @UseGuards(JwtAuthGuard)
    async generateTwoFA(@Args({ name: 'id' }) id: string) {
        try {
            return await this.authService.generateTwoFA(id);
        } catch (err) {
            throw err;
        }
    }

    @Mutation((returns) => AuthResponseType)
    @UseGuards(JwtAuthGuard)
    async removeTwoFA(
        @Args({ name: 'id' }) id: string,
        @Args({ name: 'password' }) password: string,
        @Args({ name: 'twoFAToken' }) twoFAToken: string,
    ) {
        try {
            return await this.authService.removeTwoFA(id, password, twoFAToken);
        } catch (err) {
            throw err;
        }
    }

    @Mutation((returns) => AuthResponseType)
    @UseGuards(JwtAuthGuard)
    async enableTwoFA(
        @Args({ name: 'id' }) id: string,
        @Args({ name: 'password' }) password: string,
        @Args({ name: 'twoFAToken' }) twoFAToken: string,
    ) {
        try {
            return await this.authService.enableTwoFA(id, password, twoFAToken);
        } catch (err) {
            throw err;
        }
    }

    @Mutation((returns) => AuthResponseType)
    // @UseGuards(JwtAuthGuard) // * Should not use auth guard here. Need this in not-logged in state
    async setTwoFAReset(@Args({ name: 'email' }) email: string) {
        try {
            return await this.authService.setTwoFAReset(email);
        } catch (err) {
            throw err;
        }
    }

    @Mutation((returns) => AuthResponseType)
    // @UseGuards(JwtAuthGuard) // * Should not use auth guard here. Need this in not-logged in state
    async validateTwoFAReset(
        @Args({ name: 'email' }) email: string,
        @Args({ name: 'otp' }) otp: string,
    ) {
        try {
            return await this.authService.validateTwoFAReset(email, otp);
        } catch (err) {
            throw err;
        }
    }

    // ----------------------------------------------------------------------------
    // Sign Up
    // ----------------------------------------------------------------------------

    @Mutation((returns) => AuthResponseType)
    // ! Should not use auth guard here. Need this in not-logged in state
    async signUp(@Args({ name: 'newUser' }) newUser: UserInput) {
        try {
            const res = await this.userService.registerUser(newUser);
            // res contains {message, user}
            if (res.message === 'REGISTER.EXISTING_USER') return res;
            const success = ['REGISTER.SUCCESS', 'USER.UPDATE.SUCCESS'];
            if (success.includes(res.message)) {
                await this.authService.createEmailToken(res.user.email);
            }
            await this.authService.sendEmailVerification(res.user);
            return res;
        } catch (err) {
            throw err;
        }
    }

    @Mutation((returns) => String)
    async resendUserEmailVerif(@Args({ name: 'userId' }) userId: string) {
        try {
            const user = await this.userService.getUserById(userId);
            await this.authService.sendEmailVerification(user);
            return 'REGISTER.RESEND.SUCCESS';
        } catch (err) {
            throw err;
        }
    }

    @Mutation((returns) => AuthResponseType)
    async verifyUserEmail(@Args({ name: 'token' }) token: string) {
        try {
            return await this.authService.verifyEmail(token);
        } catch (err) {
            throw err;
        }
    }

    // ----------------------------------------------------------------------------
    // Forgot and Reset Password
    // ----------------------------------------------------------------------------
    @Mutation((returns) => String)
    async sendEmailForgotPassword(@Args({ name: 'email' }) email: string) {
        try {
            const user = await this.userService.getUserByEmail(email);
            if (!user) throw 'FORGOT_PASSWORD.INVALID_EMAIL';
            const token = await this.authService.createForgotPasswordToken(email);
            await this.authService.sendEmailResetPassword(user, token);
        } catch (err) {
            // ! For security purposes, never give more info than necessary
            // throw err;
        } finally {
            return 'FORGOT_PASSWORD.SUCCESS';
        }
    }

    @Mutation((returns) => String)
    async resetPassword(
        @Args({ name: 'token' }) token: string,
        @Args({ name: 'newPasswordInput' }) newPasswordInput: ResetPasswordInput,
    ) {
        try {
            return await this.authService.resetPassword(newPasswordInput, token);
        } catch (err) {
            throw err;
        }
    }

    @Mutation((returns) => String)
    async updatePassword(@Args({ name: 'token' }) token: string) {
        try {
            return await this.authService.updatePassword(token);
        } catch (err) {
            throw err;
        }
    }
}
