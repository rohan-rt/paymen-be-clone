import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class SessionAuthGuard implements CanActivate {
    async canActivate(context: ExecutionContext) {
        // ! Session Deserializer passes user object (via FindUserbyID)
        console.log(
            '🚀 ~ file: auth.guard.ts:7 ~ SessionAuthGuard ~ canActivate ~ context:',
            context,
        );
        const ctx = GqlExecutionContext.create(context);
        const { req } = ctx.getContext();
        console.log('🚀 ~ file: session.guard.ts:14 ~ SessionAuthGuard ~ canActivate ~ req:', req);
        console.log(
            '🚀 ~ file: session.guard.ts:18 ~ SessionAuthGuard ~ canActivate ~ req.isAuthenticated():',
            req.isAuthenticated(),
        );
        // ! Uses session serializer and deserializer
        return req?.isAuthenticated() || false;
    }
}
