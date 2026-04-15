import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MomentForm } from './moment-form';

describe('MomentForm', () => {
  let component: MomentForm;
  let fixture: ComponentFixture<MomentForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MomentForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MomentForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
