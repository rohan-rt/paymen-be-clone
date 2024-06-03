import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

// Import libraries
import * as bcrypt from 'bcryptjs';

// Import config
import config from 'config';

// Import helpers
import BackblazeHelpers from 'helpers/backblaze.helper';
import { isValidEmail } from 'helpers/formatters.helper';
import { getAvatarName, clearPrefixB64, randomColorGenerator } from 'helpers/avatars-logos.helper';

// Import services
import { EmailService } from 'services/emails/email.service';
import { UtilService } from 'utils/util.service';
import { RedisService } from 'api/redis/redis.service';

// Import inputs
import { UserInput } from './inputs/user.input';
import { AvatarInput } from './inputs/avatar.input';
import { ActiveViewsInput } from './inputs/active-views.input';
import { ChangePasswordInput } from 'api/auth/inputs/change-password.input';

// Import schemas
import { UserDocument } from './schemas/user.schema';
import {
    EmailVerificationDocument,
    EnumEmailVerifType,
} from 'api/email-verifications/schemas/email-verification.schema';

// Import models
import { UserType } from './models/user.model';
import { UserResponseType } from './models/user-response.model';

const userPopulate = [
    'lastSelectedTeam',
    { path: 'lastSelectedTeam', populate: { path: 'createdBy', model: 'User' } },
    { path: 'lastSelectedTeam', populate: { path: 'updatedBy', model: 'User' } },
];

@Injectable()
export class UsersService {
    constructor(
        @InjectModel('User') private readonly userModel: Model<UserDocument>,
        @InjectModel('EmailVerification')
        private readonly emailVerificationModel: Model<EmailVerificationDocument>,
        private readonly redisService: RedisService,
        private readonly emailService: EmailService,
        private readonly utilService: UtilService,
    ) {}

    async getUserById(_id: string, full?: boolean): Promise<UserDocument> {
        const populate = full ? userPopulate : [];
        return await this.userModel.findOne({ _id }, { __v: 0 }).populate(populate);
    }

    async getUserByEmail(email: string, full?: boolean): Promise<UserDocument> {
        const populate = full ? userPopulate : [];
        return await this.userModel.findOne({ email }, { __v: 0 }).populate(populate);
    }

    async registerUser(newUser: UserInput): Promise<UserResponseType> {
        if (isValidEmail(newUser.email) && newUser.password) {
            const now = new Date();
            // 1 - Check if user already registered
            const p = await this.getUserByEmail(newUser.email);

            // 2 - Throw error if email already exist in db
            if (p?.emailVerified) return new UserResponseType('REGISTER.EXISTING_USER', p);

            // 3 - Prepare user file to create
            newUser.password = await bcrypt.hash(newUser.password, config.keys.SALT);
            newUser.roles = ['Client'];
            newUser.avatarBg = randomColorGenerator();

            // 4.1 - If the user already exists but is not verified yet, just update the user's file
            if (p && !p.emailVerified) {
                newUser._id = p._id;
                newUser.updatedAt = now;
                const res = await this.updateUser(newUser);
                return res;
            }

            // 4.2 - If the user is completely new, create a new user file
            else {
                const u = new this.userModel(newUser);
                u.createdAt = now;
                u.updatedAt = now;
                return new UserResponseType('REGISTER.SUCCESS', await u.save());
            }
        }
    }

    async updateUser(user: UserInput, compact?: boolean): Promise<UserResponseType> {
        const populate = compact ? [] : userPopulate;
        const result = await this.userModel
            .findOneAndUpdate(
                { _id: user._id },
                { $set: user, updatedAt: new Date() },
                { new: true },
            )
            .populate(populate);
        return new UserResponseType('USER.UPDATE.SUCCESS', result);
    }

    async updateUserByEmail(user: UserInput, full?: boolean): Promise<UserType> {
        const populate = full ? userPopulate : [];
        const result = await this.userModel
            .findOneAndUpdate(
                { email: user.email },
                { $set: user, updatedAt: new Date() },
                { new: true },
            )
            .populate(populate);
        return result;
    }

    async updateUserEmail(email: string, newEmail: string): Promise<UserResponseType> {
        const user = await this.getUserByEmail(email);
        if (!user) throw 'USER.EMAIL_UPDATE.INVALID_USER';
        const exists = await this.getUserByEmail(newEmail);
        //Check if the new email already exists, if yes return the response
        if (exists) return new UserResponseType('USER.EMAIL_UPDATE.EXISTING_EMAIL');
        // === Create a JWT
        const payload: object = {
            email,
            newEmail,
        };
        const token: any = this.utilService.createToken(payload);
        const now = new Date();
        const emailVerification = await this.emailVerificationModel.findOneAndUpdate(
            { email, type: EnumEmailVerifType.USER },
            {
                email,
                newEmail,
                token,
                type: EnumEmailVerifType.USER,
                createdAt: now,
                createdBy: user._id,
            },
            { upsert: true, new: true },
        );
        await this.sendVerificationToNewEmail(email, newEmail);
        return new UserResponseType('USER.EMAIL_UPDATE.SUCCESS', null, emailVerification);
    }

    async sendVerificationToNewEmail(email: string, newEmail: string): Promise<boolean> {
        const model = await this.emailVerificationModel.findOne({ newEmail });
        if (!model.token) throw 'USER.NEW_EMAIL.NO_TOKEN';
        const user = await this.getUserByEmail(email);
        return await this.emailService.sendChangeEmailVerificationEmail(
            user.firstName,
            model.newEmail,
            model.token,
            'user',
        );
    }

    async getEmailVerification(email: string): Promise<EmailVerificationDocument> {
        return await this.emailVerificationModel.findOne({
            email,
            type: 'USER',
        });
    }

    async verifyNewEmail(token: string): Promise<UserResponseType> {
        const emailVerif = await this.emailVerificationModel.findOne({ token });
        if (!emailVerif) throw 'USER.NEW_EMAIL.VERIF.INVALID_TOKEN';
        if (!emailVerif.newEmail) throw 'USER.NEW_EMAIL.VERIF.INVALID_NEW_EMAIL';
        const user = await this.getUserByEmail(emailVerif.email);
        if (!user) throw 'USER.NEW_EMAIL.VERIF.INVALID_USER';

        // Update the user's e-mail address with the new e-mail
        const res = await this.userModel.findOneAndUpdate(
            { email: emailVerif.email },
            {
                email: emailVerif.newEmail,
                updatedAt: new Date(),
            },
            { new: true, upsert: true },
        );
        // Delete the email verification object from the DB
        await emailVerif.remove();
        return new UserResponseType('USER.NEW_EMAIL.VERIF.SUCCESS', res);
    }

    async deleteNewEmail(token: string) {
        try {
            const emailVerif = await this.emailVerificationModel.findOne({ token });
            if (!emailVerif) throw 'USER.NEW_EMAIL.DELETE.INVALID_TOKEN';
            if (!emailVerif.newEmail) return 'USER.NEW_EMAIL.DELETE.INVALID_NEW_EMAIL';
            // Delete the email verification object from the DB
            await emailVerif.remove();
            return 'USER.NEW_EMAIL.DELETE.SUCCESS';
        } catch (error) {
            throw error;
        }
    }

    async updateUserAvatar(avInput: AvatarInput): Promise<UserResponseType> {
        try {
            // 1 -- Make sure we're updating the avatar of an existing user
            const found = await this.getUserById(avInput._id);
            if (!found) throw 'AVATAR.UPLOAD.INVALID_USER';

            // 2 -- Prepare the file to store it in the cloud
            const fileName = getAvatarName(avInput._id);
            const b2 = new BackblazeHelpers();
            const isInit = await b2.init();
            if (!isInit) throw 'AVATAR.UPLOAD.INIT_ERROR';

            // 3 -- Delete all preexisting versions of the file
            await b2.deleteAllFileVersions(fileName);

            // 4 -- Upload avatar to the cloud
            await b2.uploadBase64File(fileName, avInput.base64Image);

            // 5 -- Updating it into redis
            const base64 = clearPrefixB64(avInput.base64Image);
            const file = Buffer.from(base64, 'base64');
            await this.redisService.setData(fileName, file);

            // 6 -- Update DB record and return message+user
            const user = await this.avatarUpdateDb(avInput._id);
            const message = 'AVATAR.UPDATE.SUCCESS';
            return new UserResponseType(message, user);
        } catch (error) {
            throw error;
        }
    }

    async deleteUserAvatar(avInput: AvatarInput): Promise<UserResponseType> {
        try {
            const fileName = getAvatarName(avInput._id);
            const b2 = new BackblazeHelpers();
            const IsInit = await b2.init();
            if (!IsInit) throw 'AVATAR.DELETE.INIT_ERROR';
            await b2.deleteAllFileVersions(fileName);
            const user = await this.avatarUpdateDb(avInput._id);
            await this.redisService.deleteData(fileName);
            const message = 'AVATAR.DELETE.SUCCESS';
            return new UserResponseType(message, user);
        } catch (error) {
            throw error;
        }
    }

    async avatarUpdateDb(userId: string): Promise<UserType> {
        const user = {
            _id: userId,
            avatarBg: randomColorGenerator(),
        };
        const res = await this.updateUser(user);
        return res.user;
    }

    async changePassword(pw: ChangePasswordInput): Promise<string> {
        try {
            const user = await this.getUserById(pw._id);
            if (!user) throw 'PASSWORD.CHANGE.INVALID_USER';
            // Check potential twoFAToken
            if (pw.twoFAToken) {
                const isValid2FA = await this.checkUserTwoFA(pw.twoFAToken, user);
                if (!isValid2FA) throw 'PASSWORD.CHANGE.INVALID_TWOFA';
            }
            // Is the current password correct and valid?
            const curr = await bcrypt.compare(pw.currentPassword, user.password);
            if (!curr) throw 'PASSWORD.CHANGE.CURRENT_PASSWORD_INCORRECT';
            // Does the throw password differ from the current password?
            if (pw.currentPassword === pw.newPassword) throw 'PASSWORD.CHANGE.NEW_EQUALS_CURRENT';
            // Check whether confirm pass and new pass are equal
            if (pw.newPassword !== pw.confirmNewPassword)
                throw 'PASSWORD.CHANGE.NEW_DIFFERS_CONFIRM';

            pw.newPassword = await bcrypt.hash(pw.newPassword, config.keys.SALT);
            const data = {
                _id: pw._id,
                password: pw.newPassword,
            };
            await this.updateUser(data, true);
            return 'PASSWORD.CHANGE.SUCCESS';
        } catch (error) {
            throw error;
        }
    }

    // 2FA
    async setTwoFASecret(id: string, secret: string): Promise<UserType> {
        const user = {
            '_id': id,
            'twoFA.secret': secret,
        };
        const res = await this.updateUser(user, true);
        return res.user;
    }
    async enableTwoFA(id: string): Promise<UserType> {
        const user = {
            '_id': id,
            'twoFA.isEnabled': true,
        };
        const res = await this.updateUser(user, true);
        return res.user;
    }
    async setTwoFAReset(id: string, otp: string): Promise<UserType> {
        const user = {
            '_id': id,
            'twoFA.resetCode': otp,
            'twoFA.resetCreated': new Date(),
        };
        const res = await this.updateUser(user, true);
        return res.user;
    }
    async resetTwoFA(id: string): Promise<UserType> {
        const user = {
            '_id': id,
            'twoFA.secret': null,
            'twoFA.isEnabled': false,
            'twoFA.resetCode': null,
            'twoFA.resetCreated': null,
        };
        const res = await this.updateUser(user, true);
        return res.user;
    }
    async checkUserTwoFA(twoFAToken: string, user: UserInput, strict?: boolean) {
        if (!twoFAToken && user?.twoFA?.isEnabled) throw '2FA_USER.CHECK.MISSING_CODE';
        const strictCheck = strict ? user?.twoFA?.isEnabled : true;
        if (twoFAToken && user?.twoFA?.secret && strictCheck) {
            return await this.utilService.validateTwoFA(twoFAToken, user.twoFA.secret);
        }
        throw '2FA_USER.CHECK.INVALID_REQUEST';
    }

    // VIEWS
    async addFavView(id: string, viewId: string): Promise<UserType> {
        if (!id) throw 'USER.FAV_VIEW.ID_MISSING';
        let user = await this.getUserById(id);
        const exists = user.favViews.findIndex((v) => v === viewId);
        if (exists > -1) throw 'USER.FAV_VIEWS.VIEW_ALREADY_EXISTS';
        user.favViews.push(viewId);
        user.updatedAt = new Date();
        return await user.save();
    }
    async removeFavView(id: string, viewId: string): Promise<UserType> {
        if (!id) throw 'USER.FAV_VIEW.ID_MISSING';
        let user = await this.getUserById(id);
        const exists = user.favViews.findIndex((v) => v === viewId);
        if (exists < 0) throw 'USER.FAV_VIEWS.VIEW_DOESNOT_EXISTS';
        user.favViews = user.favViews.filter((v) => v !== viewId);
        user.updatedAt = new Date();
        return await user.save();
    }
    async setActiveViews(id: string, views: ActiveViewsInput): Promise<UserType> {
        const payload = {
            _id: id,
            activeViews: views,
        };
        const res = await this.updateUser(payload);
        return res.user;
    }

    // async deleteUserById(id: string): Promise<string> {
    //     try {
    //         if (!id) throw 'USER.ID_MISSING';
    //         await this.userModel.deleteOne({ _id: id });
    //         return 'USER.DELETED';
    //     } catch (err) {
    //         throw err;
    //     }
    // }
}
