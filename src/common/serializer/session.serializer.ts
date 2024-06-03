import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { UsersService } from 'api/users/users.service';

@Injectable()
export class SessionSerializer extends PassportSerializer {
    constructor(private readonly usersService: UsersService) {
        super();
    }

    serializeUser(
        payload: any,
        done: (err: Error, user: { userId: string; device: string; location: string }) => void,
    ): any {
        console.log(
            '🚀 ~ file: session.serializer.ts:13 ~ SessionSerializer ~ serializeUser ~ payload:',
            payload,
        );
        // ! Creates session cookie in DB for particular user
        done(null, {
            userId: payload.user._id,
            device: payload.device,
            location: payload.location,
        });
    }

    async deserializeUser(payload: any, done: (err: Error, payload: any) => void): Promise<any> {
        // !! Validates user against session cookie
        done(null, payload);
    }
}
