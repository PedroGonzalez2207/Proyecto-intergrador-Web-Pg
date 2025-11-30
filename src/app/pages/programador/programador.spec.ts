import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Programador } from './programador';

describe('Programador', () => {
  let component: Programador;
  let fixture: ComponentFixture<Programador>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Programador]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Programador);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
