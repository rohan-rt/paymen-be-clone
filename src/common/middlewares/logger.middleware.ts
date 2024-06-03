import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    use(req: any, res: Response, next: Function) {
        try {
            const offuscateRequest = JSON.parse(JSON.stringify(req.body));
            if (offuscateRequest && offuscateRequest.password)
                offuscateRequest.password = '*******';
            if (offuscateRequest && offuscateRequest.newPassword)
                offuscateRequest.newPassword = '*******';
            if (offuscateRequest && offuscateRequest.currentPassword)
                offuscateRequest.currentPassword = '*******';
        } catch (error) {}
        next();
    }
}
