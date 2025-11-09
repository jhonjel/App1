import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { corsInterceptorGuard } from './cors.interceptor-guard';

describe('corsInterceptorGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => corsInterceptorGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
