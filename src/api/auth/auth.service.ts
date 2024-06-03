import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
const mongoose = require('mongoose');

// Import libraries
import * as bcrypt from 'bcryptjs';

// Import services
import { UtilService } from 'utils/util.service';
import { UsersService } from '../users/users.service';
import { EmailService } from 'services/emails/email.service';
import { TeamInvitationsService } from 'api/team-invitations/team-invitations.service';
import { SupplierInvitationsService } from 'api/supplier-invitations/supplier-invitations.service';

// Import inputs
import { UserInput } from 'api/users/inputs/user.input';
import { ResetPasswordInput } from './inputs/reset-password.input';

// Import schemas and enums
import { ForgotPasswordDocument } from './schemas/forgot-password.schema';
import { UpdatePasswordDocument } from './schemas/update-password.schema';
import {
    EnumEmailVerifType,
    EmailVerificationDocument,
} from 'api/email-verifications/schemas/email-verification.schema';

// Import interfaces & models
import { AuthResponseType } from './models/auth-response.model';
import { TwoFAResponseType } from './models/twoFA-response.model';

// Import helpers
import { generateOTP, dateDiff } from 'helpers/formatters.helper';

// Import configs
import config from 'config';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel('EmailVerification')
        private readonly emailVerificationModel: Model<EmailVerificationDocument>,
        @InjectModel('ForgotPassword')
        private readonly forgotPasswordModel: Model<ForgotPasswordDocument>,
        @InjectModel('UpdatePassword')
        private readonly updatePasswordModel: Model<UpdatePasswordDocument>,
        private readonly utilService: UtilService,
        private readonly emailService: EmailService,
        private readonly usersService: UsersService,
        private readonly teamInvitationsService: TeamInvitationsService,
        private readonly supplierInvitationsService: SupplierInvitationsService,
    ) {}

    logout(req: any): string {
        req.sessionStore.destroy();
        req.logout((callback) => {});
        req.session.cookie.maxAge = 0;
        return 'LOGOUT.SUCCESS';
    }

    async validateLogin(
        email: string,
        password: string,
        twoFAToken?: string,
    ): Promise<AuthResponseType> {
        // try {
        const user = await this.usersService.getUserByEmail(email);
        if (!user) throw 'LOGIN.INVALID_CREDENTIALS';
        if (!user.isSecure) throw 'LOGIN.INSECURE_ACCOUNT';
        if (!user.emailVerified) throw 'LOGIN.EMAIL_NOT_VERIFIED';
        const isValidPass = user?.password ? await bcrypt.compare(password, user.password) : false;
        if (!isValidPass) throw 'LOGIN.INVALID_CREDENTIALS';

        let m, u; // Message & User object for AuthResponse
        const has2FA = user?.twoFA?.isEnabled || false;
        // 1 -- Validate TwoFA token
        if (twoFAToken) {
            if (!has2FA) throw 'LOGIN.2FA_DISABLED';
            const isValid2FA = await this.usersService.checkUserTwoFA(twoFAToken, user, true);
            if (!isValid2FA) throw 'LOGIN.2FA_INVALID_TOKEN';
            m = 'LOGIN.2FA_VALIDATED';
            u = user;
        } else {
            if (has2FA) throw 'LOGIN.PROMPT_2FA';
            // ! JWT token is populated including SessionID token afterwards
            m = 'LOGIN.VALIDATED';
            u = user;
        }

        return new AuthResponseType(m, u);
    }

    setAuthResponse(user: UserInput, sessionId: string): AuthResponseType {
        if (!user || !sessionId) throw 'LOGIN.INVALID_REQUEST';
        const { _id, email, roles } = user;
        const token = this.createAuthToken(_id, email, roles, sessionId);
        return new AuthResponseType('LOGIN.SUCCESS', user, token);
    }

    createAuthToken(_id: string, email: string, roles: string[], sessionId: string) {
        const payload: object = { _id, email, roles, sessionId };
        return this.utilService.createToken(payload);
    }

    async validateCredentials(user: UserInput, password: string, twoFAToken?: string) {
        if (!user) throw 'VALIDATE_CREDENTIALS.INVALID_USER';
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) throw 'VALIDATE_CREDENTIALS.INVALID_PASSWORD';
        const hasTwoFA = user.twoFA?.isEnabled || false;
        if (hasTwoFA) return await this.usersService.checkUserTwoFA(twoFAToken, user, true);
        else return validPassword;
    }

    async generateTwoFA(id: string): Promise<TwoFAResponseType> {
        const user = await this.usersService.getUserById(id);
        const twoFA = await this.utilService.generateTwoFA(user.email, config.keys.TWOFA.OTP_NAME);
        const { secret, otpURL } = twoFA;
        await this.usersService.setTwoFASecret(id, secret);
        return new TwoFAResponseType(secret, otpURL);
    }

    async enableTwoFA(id: string, password: string, twoFAToken: string): Promise<AuthResponseType> {
        const user = await this.usersService.getUserById(id);
        const isValidPass = user ? await bcrypt.compare(password, user?.password) : false;
        const isValid2FA = await this.usersService.checkUserTwoFA(twoFAToken, user);
        if (!isValidPass || !isValid2FA) throw '2FA.ACTIVATION.PASSWORD_OR_TOKEN_INVALID';
        await this.usersService.enableTwoFA(id);
        return new AuthResponseType('2FA.ACTIVATION.SUCCESS');
    }

    async setTwoFAReset(email: string): Promise<AuthResponseType> {
        const user = await this.usersService.getUserByEmail(email);
        if (!user) throw '2FA.SET_RESET.USER_NOT_FOUND';
        const otp = generateOTP();
        await this.usersService.setTwoFAReset(user._id, otp);
        await this.emailService.sendResetTwoFAEmail(user, otp);
        return new AuthResponseType('2FA.SET_RESET.EMAIL_SENT');
    }

    async validateTwoFAReset(email: string, otp: string): Promise<AuthResponseType> {
        const user = await this.usersService.getUserByEmail(email);
        if (!user) throw '2FA.VALIDATE_RESET.USER_NOT_FOUND';
        const now = new Date();
        const diffMins = dateDiff(user.twoFA.resetCreated, now, 'minutes');
        const otpExpired = diffMins > config.intervals.VALID_2FA_OTP;
        const otpValid = user.twoFA.resetCode === otp && !otpExpired;
        if (!otpValid) throw '2FA.VALIDATE_RESET.OTP_INVALID';
        await this.usersService.resetTwoFA(user._id);
        return new AuthResponseType('2FA.VALIDATE_RESET.SUCCESS');
    }

    async removeTwoFA(id: string, password: string, twoFAToken: string): Promise<AuthResponseType> {
        const user = await this.usersService.getUserById(id);
        const isValidPass = user ? await bcrypt.compare(password, user?.password) : false;
        const isValid2FA = await this.usersService.checkUserTwoFA(twoFAToken, user, true);
        if (!isValidPass || !isValid2FA) throw '2FA.REMOVE.PASSWORD_OR_TOKEN_INVALID';
        await this.usersService.resetTwoFA(user._id);
        return new AuthResponseType('2FA.REMOVE.SUCCESS');
    }

    async createEmailToken(email: string): Promise<EmailVerificationDocument> {
        // 1 -- Delete potentially existing user emailVerif
        await this.emailVerificationModel.findOneAndDelete({
            email: email,
            type: EnumEmailVerifType.USER,
        });

        // 2 -- Create a new user emailVerif
        const newEmailVerificationId = mongoose.Types.ObjectId();
        // === Create a JWT
        const payload: object = {
            _id: newEmailVerificationId,
            email,
        };
        const token: any = this.utilService.createToken(payload);
        const emailVerification = new this.emailVerificationModel({
            _id: newEmailVerificationId,
            email: email,
            token: token,
            type: EnumEmailVerifType.USER,
            createdAt: new Date(),
        });
        return await emailVerification.save();
    }

    async sendEmailVerification(newUser: UserInput): Promise<string> {
        const emailVerif = await this.emailVerificationModel.findOne({ email: newUser.email });
        if (!emailVerif) throw 'REGISTER.VERIFICATION.INVALID_REQUEST';
        const user = await this.usersService.getUserByEmail(newUser.email);
        if (!user) throw 'REGISTER.VERIFICATION.INVALID_USER';
        await this.emailService.sendEmailVerificationEmail(
            user,
            emailVerif.token,
            EnumEmailVerifType.USER,
        );
        return 'REGISTER.VERIFICATION.EMAIL_SENT';
    }

    async verifyEmail(token: string): Promise<AuthResponseType> {
        const emailVerif = await this.emailVerificationModel.findOne({ token });
        if (!emailVerif) throw 'REGISTER.VERIFICATION.INVALID_REQUEST';

        // 1 -- Check whether user exists
        const user = await this.usersService.getUserByEmail(emailVerif.email);
        if (!user) throw 'REGISTER.VERIFICATION.INVALID_USER';

        // 2 -- Check whether user is already verified
        if (user.emailVerified) {
            emailVerif.remove();
            return new AuthResponseType('REGISTER.VERIFICATION.ALREADY_VERIFIED');
        }

        // 3 -- If not verified, update to verified and remove emailVerif
        const payload = {
            email: emailVerif.email,
            emailVerified: true,
        };
        await this.usersService.updateUserByEmail(payload);
        await emailVerif.remove();

        // 4 -- Check and update team invites based on newly registered user's email
        const teamInvs = await this.teamInvitationsService.getTeamInvitationsByEmail(user.email);

        await Promise.all(
            teamInvs?.map(async (e) => {
                await this.teamInvitationsService.updateTeamInvitation({
                    token: e.token,
                    inviteeId: user._id,
                });
            }),
        );

        // 5 -- Check and update supplier invites based on newly registered user's email
        const suppInvs = await this.supplierInvitationsService.getSupplierInvitesByEmail(
            user.email,
        );
        await Promise.all(
            suppInvs?.map(async (e) => {
                const obj: any = {
                    token: e.token,
                    inviteeId: user._id,
                };
                await this.supplierInvitationsService.updateSupplierInvite(obj);
            }),
        );

        // 6 -- Return user object
        return new AuthResponseType('REGISTER.VERIFICATION.SUCCESS', user);
    }

    async createForgotPasswordToken(email: string): Promise<string> {
        const fp = await this.forgotPasswordModel.findOne({ email });
        if (fp) {
            return fp.token; //"FORGOTPASSWORD.TOKEN_ALREADY_EXISTS"
        } else {
            const fpId = mongoose.Types.ObjectId();
            // === Create a JWT
            const payload: object = {
                _id: fpId,
                email: email,
            };
            const token: any = this.utilService.createToken(payload);
            const nfp = new this.forgotPasswordModel({
                _id: fpId,
                token,
                email,
                updatedAt: new Date(),
            });
            await nfp.save();
            return token;
        }
    }

    async sendEmailResetPassword(user: UserInput, token: string): Promise<string> {
        if (!token) throw 'RESET_PASSWORD.TOKEN_NOT_FOUND';
        await this.emailService.sendResetPasswordEmail(user, token);
        return 'RESET_PASSWORD.EMAIL_SENT';
    }

    async resetPassword(
        rp: ResetPasswordInput, // New password and confirm new password fields
        token: string, // forgotPassword object from the DB to be retrieved from URL
    ): Promise<string> {
        if (rp.newPassword !== rp.confirmNewPassword) throw 'RESET_PASSWORD.PASSWORDS_DONT_MATCH';
        const decodedToken: any = this.utilService.verifyToken(token);
        if (!decodedToken) throw 'RESET_PASSWORD.INVALID_TOKEN';
        const fp = await this.forgotPasswordModel.findOne({
            _id: decodedToken._id,
            token,
        });
        if (!fp) throw 'RESET_PASSWORD.TOKEN_EXPIRED';
        rp.newPassword = await bcrypt.hash(rp.newPassword, config.keys.SALT);

        // Create a new object in updatepasswords in the DB
        await this.updatePasswordModel.deleteOne({ email: fp.email });
        const upId = mongoose.Types.ObjectId();
        // === Create a JWT
        const payload: object = {
            _id: upId,
            email: fp.email,
        };
        const upToken: any = this.utilService.createToken(payload);
        const up = new this.updatePasswordModel({
            _id: upId,
            token: upToken,
            email: fp.email,
            newPassword: rp.newPassword,
            updatedAt: new Date(),
        });
        await up.save();

        // Send a confirmation email to finally reset and update new password
        await this.sendConfirmationEmailUpdatedPassword(fp.email, upToken);

        // If we reach to here in the Try&Catch, that means we've successfully sent a password update confirmation mail
        // Make sure to delete the forgotPassword obj though!
        await fp.remove();

        return 'RESET_PASSWORD.SUCCESS';
    }

    async sendConfirmationEmailUpdatedPassword(email: string, token: string): Promise<string> {
        const user = await this.usersService.getUserByEmail(email);
        if (!user) throw 'UPDATE_PASSWORD.EMAIL.INVALID_USER';
        // sendUpdatePasswordConfirmationEmail can only return True or error
        await this.emailService.sendUpdatePasswordConfirmationEmail(user, token);
        return 'UPDATE_PASSWORD.EMAIL.SENT';
    }

    async updatePassword(token: string): Promise<string> {
        // UpdatePassword token is needed to find object, get the newPassword and update the actual password it
        const decodedToken: any = this.utilService.verifyToken(token);
        if (!decodedToken) throw 'UPDATE_PASSWORD.INVALID_TOKEN';

        const up = await this.updatePasswordModel.findOne({ token });
        if (!up) throw 'UPDATE_PASSWORD.INVALID_REQUEST';

        const user = await this.usersService.getUserByEmail(up.email);
        if (!user) throw 'UPDATE_PASSWORD.INVALID_USER';

        // Create a new object in updatepasswords in the DB
        const payload = {
            _id: user._id,
            password: up.newPassword,
            isSecure: true, // ! In case DeleteAllSessions was triggered
        };
        await this.usersService.updateUser(payload, true);

        await up.remove();
        return 'UPDATE_PASSWORD.SUCCESS';
    }
}
