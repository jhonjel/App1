import { TestBed } from '@angular/core/testing';

import { Loaddata } from './loaddata';

describe('Loaddata', () => {
  let service: Loaddata;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Loaddata);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
