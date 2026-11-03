import { HttpInterceptorFn } from '@angular/common/http';
import { getAuthorization } from './auth-state';

export const basicAuthInterceptor: HttpInterceptorFn = (request, next) => {
  const authorization = getAuthorization();
  if (!authorization || !request.url.includes('/api/admin/')) {
    return next(request);
  }

  return next(request.clone({ setHeaders: { Authorization: authorization } }));
};
