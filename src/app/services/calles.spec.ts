import { TestBed } from '@angular/core/testing';

import { Calles } from './calles';

describe('Calles', () => {
  let service: Calles;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Calles);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
