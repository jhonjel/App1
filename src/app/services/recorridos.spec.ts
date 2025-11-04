import { TestBed } from '@angular/core/testing';

import { Recorridos } from './recorridos';

describe('Recorridos', () => {
  let service: Recorridos;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Recorridos);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
