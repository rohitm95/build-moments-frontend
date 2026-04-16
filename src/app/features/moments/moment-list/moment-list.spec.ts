import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MomentList } from './moment-list';

describe('MomentList', () => {
  let component: MomentList;
  let fixture: ComponentFixture<MomentList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MomentList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MomentList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
