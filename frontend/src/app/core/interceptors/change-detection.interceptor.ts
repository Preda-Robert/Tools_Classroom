import { HttpInterceptorFn } from '@angular/common/http';
import { inject, NgZone } from '@angular/core';
import { tap } from 'rxjs/operators';

export const changeDetectionInterceptor: HttpInterceptorFn = (req, next) => {
  const ngZone = inject(NgZone);
  return next(req).pipe(
    tap(() => {
      // Force Angular to run change detection after each HTTP response
      ngZone.run(() => {});
    })
  );
};
