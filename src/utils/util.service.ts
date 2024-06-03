import * as jwt from 'jsonwebtoken';
import { Injectable } from '@nestjs/common';

// Import configs
import config from 'config';

// Import libraries
import { toDataURL } from 'qrcode';
import { authenticator } from 'otplib';

@Injectable()
export class UtilService {
    createToken(payload: object): string {
        try {
            const secretOrKey = config.keys.JWT.SECRET;
            const options = {
                expiresIn: config.keys.JWT.EXPIRY,
            };
            const token = jwt.sign(payload, secretOrKey, options);
            return token;
        } catch (err) {
            throw err;
        }
    }

    verifyToken(token: string): string | object {
        try {
            const secretOrKey = config.keys.JWT.SECRET;
            const decodedToken = jwt.verify(token, secretOrKey);
            return decodedToken;
        } catch (err) {
            return null;
        }
    }

    async generateTwoFA(email: string, name: string): Promise<any> {
        const secret = authenticator.generateSecret();
        const otpURI = authenticator.keyuri(email, name, secret);
        const otpURL = await toDataURL(otpURI);
        return { secret, otpURL };
    }

    async validateTwoFA(token: string, secret: string): Promise<boolean> {
        return authenticator.verify({ token, secret });
    }
}
