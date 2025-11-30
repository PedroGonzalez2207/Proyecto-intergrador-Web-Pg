import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramadorPortafolio } from './programador-portafolio';

describe('ProgramadorPortafolio', () => {
  let component: ProgramadorPortafolio;
  let fixture: ComponentFixture<ProgramadorPortafolio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgramadorPortafolio]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgramadorPortafolio);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
