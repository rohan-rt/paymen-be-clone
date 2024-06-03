import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';

// Import services
import { UsersService } from 'api/users/users.service';

// Import configs
import config from 'config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly usersService: UsersService) {
        super(
            {
                jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
                passReqToCallback: true,
                secretOrKey: config.keys.JWT.SECRET,
                ignoreExpiration: false,
            },
            // async (req, payload, next) => await this.verify(req, payload, next),
        );
        // passport.use(this);
    }

    public async validate(payload: any, req: any, done: Function) {
        // const user = await this.usersService.getUserById(req._id);
        // if (!user) return done(new UnauthorizedException(), false);
        if (req?._id && req?.email && req.sessionId === payload.sessionID) return done(null, req);
        else return done(new UnauthorizedException(), false);
        // return done(null, user);
    }
}
