import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestBackend } from './test-backend';

describe('TestBackend', () => {
  let component: TestBackend;
  let fixture: ComponentFixture<TestBackend>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestBackend]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestBackend);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
