import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GQLAuthGuard extends AuthGuard('local') {
    getRequest(context: ExecutionContext) {
        console.log('🚀 ~ file: gql.guard.ts:8 ~ GQLAuthGuard ~ getRequest ~ context:', context);
        const ctx = GqlExecutionContext.create(context);
        const { req } = ctx.getContext();
        if (req) {
            const variables = ctx.getArgs();
            const userInfo = `${variables.email}---${req.headers['user-agent']}---${variables.location}---${variables?.twoFAToken}`;
            req.body.username = userInfo;
            req.body.password = variables.password;
        }
        return req;
    }
}
