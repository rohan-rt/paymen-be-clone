import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
    data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
        console.log(
            '🚀 ~ file: transform.interceptor.ts:12 ~ TransformInterceptor<T> ~ intercept ~ context',
            context,
        );
        return next.handle().pipe(map((data) => ({ data })));
    }
}
