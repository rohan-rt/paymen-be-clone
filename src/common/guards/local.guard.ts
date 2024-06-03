import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
    async canActivate(context: ExecutionContext) {
        console.log(
            '🚀 ~ file: local.guard.ts:8 ~ LocalAuthGuard ~ canActivate ~ context:',
            context,
        );
        const ctx = GqlExecutionContext.create(context);
        const { req } = ctx.getContext();
        if (req) {
            // ! Handle via session.serializer  (serializeUser)
            console.log('🚀 ~ file: local.guard.ts:30 ~ LocalAuthGuard ~ canActivate ~ req');
            await super.logIn(req);
            console.log(
                '🚀 ~ file: local.guard.ts:38 ~ LocalAuthGuard ~ canActivate ~ super.logIn(req)',
            );
            return true;
        }
    }
}
