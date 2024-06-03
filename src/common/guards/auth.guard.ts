import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
    async canActivate(context: ExecutionContext) {
        console.log(
            '🚀 ~ file: auth.guard.ts:7 ~ AuthenticatedGuard ~ canActivate ~ context:',
            context,
        );
        const ctx = GqlExecutionContext.create(context);
        const { req } = ctx.getContext();
        // ! isAuthenticated() gets response from done() from deserializeUser in sesson.serializer
        if (req) return req.isAuthenticated();
        const request = context.switchToHttp().getRequest();
        console.log(
            '🚀 ~ file: auth.guard.ts:20 ~ AuthenticatedGuard ~ canActivate ~ request:',
            request,
        );
        return request.isAuthenticated();
    }
}
