import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class UserPublicInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      map((data: User | User[]) => {
        if (Array.isArray(data)) {
          for (const user of data) {
            delete user.email;
            delete user.password;
          }
        } else {
          delete data.email;
          delete data.password;
        }

        return data;
      }),
    );
  }
}
