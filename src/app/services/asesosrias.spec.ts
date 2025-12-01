import { TestBed } from '@angular/core/testing';

import { Asesosrias } from './asesosrias';

describe('Asesosrias', () => {
  let service: Asesosrias;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Asesosrias);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
