import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramadorAsesorias } from './programador-asesorias';

describe('ProgramadorAsesorias', () => {
  let component: ProgramadorAsesorias;
  let fixture: ComponentFixture<ProgramadorAsesorias>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgramadorAsesorias]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgramadorAsesorias);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
