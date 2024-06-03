import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import config from 'config';
import { Reflector } from '@nestjs/core';

@Injectable()
export class ApiKeyGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const headers = context.getArgs()[2].req.headers;
        const apiKey = headers['x-api-key'];
        // Check if the API key is valid
        return apiKey === config.keys.API_KEY;
    }
}
