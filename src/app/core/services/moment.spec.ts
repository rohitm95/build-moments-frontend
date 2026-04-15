import { TestBed } from '@angular/core/testing';

import { Moment } from './moment';

describe('Moment', () => {
  let service: Moment;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Moment);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
