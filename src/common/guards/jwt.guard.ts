import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    getRequest(context: ExecutionContext) {
        // console.log('🚀 ~ file: jwt-auth.guard.ts:9 ~ JwtAuthGuard ~ getRequest ~ context:');
        const ctx = GqlExecutionContext.create(context);
        // console.log('🚀 ~ file: jwt-auth.guard.ts:11 ~ JwtAuthGuard ~ getRequest ~ ctx:');
        return ctx.getContext().req;
    }
}
