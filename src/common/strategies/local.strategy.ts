import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

// Import services
import { AuthService } from '../../api/auth/auth.service';
import { SessionsService } from '../../api/sessions/sessions.service';

// Import models
import { AuthResponseType } from 'api/auth/models/auth-response.model';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly authService: AuthService,
        private sessionsService: SessionsService,
    ) {
        super({});
    }
    async validate(username: string, password: string): Promise<AuthResponseType> {
        try {
            console.log('🚀 ~ file: local.strategy.ts:26 ~ LocalStrategy ~ validate ~ username:');
            const data = username.split('---');
            const email = data[0];
            const device = data[1];
            const location = data[2] === undefined ? null : data[2];
            const twoFAToken = data[3] === 'undefined' ? null : data[3];

            const authRes = await this.authService.validateLogin(email, password, twoFAToken);

            // ! Make user aware of log in and allow possibility to log out remotely!
            const token = await this.sessionsService.createDeleteSessionsToken(email);
            await this.sessionsService.sendEmailDeleteSessions(authRes.user, token);

            authRes['device'] = device;
            authRes['location'] = location;
            return authRes;
        } catch (err) {
            // ! If 2FA is enabled, then stop here and prompt the user to pass 2FA validation
            console.log('🚀 ~ file: local.strategy.ts:52 ~ LocalStrategy ~ validate ~ err:', err);
            if (typeof err === 'string') throw err;
            throw new UnauthorizedException();
        }
    }
}
