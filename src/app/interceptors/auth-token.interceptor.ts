import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../environments/environments';
import { Auth } from '../services/auth';
import { catchError, filter, switchMap, take, timeout } from 'rxjs';

export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  if (typeof window === 'undefined') return next(req);

  const apiBase = (environment.apiBaseUrl || '').toLowerCase();
  const url = (req.url || '').toLowerCase();

  const isApi =
    (apiBase && url.startsWith(apiBase)) ||
    url.includes('/gproyecto-backend/api/');

  if (!isApi) return next(req);

  const auth = inject(Auth);

  const attach = () => {
    const jwt = window.localStorage.getItem('jwt');
    if (!jwt) return next(req);
    return next(req.clone({ setHeaders: { Authorization: `Bearer ${jwt}` } }));
  };

  const jwtNow = window.localStorage.getItem('jwt');
  if (jwtNow) return attach();

  return auth.jwtReady$.pipe(
    filter((v) => v === true),
    take(1),
    timeout(2000),
    switchMap(() => attach()),
    catchError(() => next(req))
  );
};
