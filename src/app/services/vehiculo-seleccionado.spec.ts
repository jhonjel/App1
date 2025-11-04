import { TestBed } from '@angular/core/testing';

import { VehiculoSeleccionado } from './vehiculo-seleccionado';

describe('VehiculoSeleccionado', () => {
  let service: VehiculoSeleccionado;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VehiculoSeleccionado);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
