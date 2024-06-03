import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
const mongoose = require('mongoose');

// Import inputs
import { UserInput } from 'api/users/inputs/user.input';

// Import schemas
import { SessionDocument } from './schemas/session.schema';
import { DeleteSessionsDocument } from './schemas/delete-sessions.schema';

// Import models
import { SessionType } from './models/session.model';
import { SessionResponseType } from 'api/sessions/models/session-response.model';

// Import services
import { UtilService } from 'utils/util.service';
import { AuthService } from 'api/auth/auth.service';
import { EmailService } from 'services/emails/email.service';
import { UsersService } from 'api/users/users.service';
import { UserType } from 'api/users/models/user.model';

@Injectable()
export class SessionsService {
    constructor(
        @InjectModel('Sessions') private readonly sessionsModel: Model<SessionDocument>,
        @InjectModel('DeleteSessions')
        private readonly deleteSessionsModel: Model<DeleteSessionsDocument>,

        private readonly utilService: UtilService,
        private readonly authService: AuthService,
        private readonly emailService: EmailService,
        private readonly usersService: UsersService,
    ) {}

    async getAllSessionsByUser(userId: string): Promise<SessionType[]> {
        return await this.sessionsModel.find({
            'session.passport.user.userId': mongoose.Types.ObjectId(userId),
        });
    }
    async getAllSessionResponses(
        userId: string,
        sessionId: string,
    ): Promise<SessionResponseType[]> {
        const sessions = await this.getAllSessionsByUser(userId);
        return sessions.map((r) => ({
            _id: r._id,
            device: r.session.passport.user.device,
            location: r.session.passport.user.location,
            current: r._id === sessionId,
            createdAt: new Date(
                r.session.cookie.expires.getTime() - r.session.cookie.originalMaxAge,
            ),
        }));
    }

    // req is context object
    destroySession(req: any, sessionId: string): boolean {
        req.sessionStore.destroy(sessionId, (err: any) => {
            // callback function. If an error occurs, it will be accessible here.
        });
        return true;
    }

    // req is context object
    async revokeSession(
        req: any,
        sessionId: string,
        password: string,
        twoFAToken?: string,
        full?: boolean,
    ): Promise<string | SessionResponseType[]> {
        const userId = req.user._id;
        const current = sessionId === req.sessionID;
        if (current) throw 'REVOKE_SESSION.IS_CURRENT_SESSION';
        const user = await this.usersService.getUserById(userId);
        if (!user) throw 'REVOKE_SESSION.INVALID_USER';
        const valid = await this.authService.validateCredentials(user, password, twoFAToken);
        if (!valid) throw 'REVOKE_SESSION.INVALID_CREDENTIALS';
        this.destroySession(req, sessionId);
        if (full) return await this.getAllSessionsByUser(userId);
        else return 'REVOKE_SESSION.SUCCESS';
    }

    // req is context object
    async revokeAllSessions(
        req: any,
        password: string,
        twoFAToken?: string,
        full?: boolean,
    ): Promise<string | SessionResponseType[]> {
        const userId = req.user._id;
        const user = await this.usersService.getUserById(userId);
        if (!user) throw 'REVOKE_SESSIONS.INVALID_USER';
        const valid = await this.authService.validateCredentials(user, password, twoFAToken);
        if (!valid) throw 'REVOKE_SESSIONS.INVALID_CREDENTIALS';
        const sessions = await this.getAllSessionsByUser(userId);

        for (let i = 0; i < sessions?.length; i++) {
            const session = sessions[i];
            if (session._id !== req.sessionID) this.destroySession(req, session._id);
        }

        if (full) return await this.getAllSessionsByUser(userId);
        else return 'REVOKE_SESSIONS.SUCCESS';
    }

    // -----------
    // DELETE SESSIONS as back-up safety measure
    // -----------

    async createDeleteSessionsToken(email: string): Promise<string> {
        // 1 -- Ensure deleting any preexisting entry
        await this.deleteSessionsModel.findOneAndDelete({ email });
        // 2 - Create new JWT
        const dsId = mongoose.Types.ObjectId();
        const payload: object = {
            _id: dsId,
            email: email,
        };
        const token: any = this.utilService.createToken(payload);
        // 3 -- Save it to DB
        const nds = new this.deleteSessionsModel({
            _id: dsId,
            token,
            email,
            updatedAt: new Date(),
        });
        await nds.save();
        return token;
    }

    async sendEmailDeleteSessions(user: UserInput, token: string): Promise<string> {
        if (!token) throw 'DELETE_SESSIONS.TOKEN_NOT_FOUND';
        await this.emailService.sendDeleteSessionsEmail(user, token);
        return 'RESET_PASSWORD.EMAIL_SENT';
    }

    // req is context object
    async deleteAllSessions(req: any, token: string) {
        const user = await this.deleteSessionsByToken(token);
        if (!user) throw 'DELETE_SESSIONS.INVALID_REQUEST';
        const sessions = await this.getAllSessionsByUser(user._id);
        if (!sessions) throw 'DELETE_SESSIONS.NO_SESSIONS_FOUND';

        for (let i = 0; i < sessions?.length; i++) {
            const session = sessions[i];
            this.destroySession(req, session._id);
        }

        const fpToken = await this.authService.createForgotPasswordToken(user.email);
        await this.authService.sendEmailResetPassword(user, fpToken);
        return 'DELETE_SESSIONS.SUCCESS';
    }

    async deleteSessionsByToken(token: string): Promise<UserType> {
        const decodedToken: any = this.utilService.verifyToken(token);
        if (!decodedToken) throw 'DELETE_SESSIONS.INVALID_TOKEN';
        const sd = await this.deleteSessionsModel.findOne({
            _id: decodedToken._id,
            token,
        });
        if (!sd) throw 'DELETE_SESSIONS.INVALID_TOKEN';
        const payload = {
            email: sd.email,
            isSecure: false,
        };
        const user = await this.usersService.updateUserByEmail(payload);
        await sd.remove();
        return user;
    }
}
