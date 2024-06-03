import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { from, Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const roles = this.reflector.get<string[]>('roles', context.getHandler());
        if (!roles) return true;

        const req = context.switchToHttp().getRequest();
        const user = req.user;

        const hasRole = () => user.roles.some((roles) => roles.indexOf(roles) > -1);
        const hasPermission = false;
        /* if (hasRole()) {
            if (req.params.id || req.user._id) {
                console.log("test here");
                console.log(req.user._id);
                console.log(req.params.id);
            	
                if (req.user._id === req.params.id) {
                    hasPermission = true;
                }
            }
        } */
        //	console.log(hasPermission);
        return user?.roles && hasRole();
    }
}
