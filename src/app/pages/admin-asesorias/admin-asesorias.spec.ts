import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAsesorias } from './admin-asesorias';

describe('AdminAsesorias', () => {
  let component: AdminAsesorias;
  let fixture: ComponentFixture<AdminAsesorias>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminAsesorias]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminAsesorias);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
