import { TestBed } from '@angular/core/testing';

import { MoverService } from './mover.service';

describe('MoverService', () => {
  let service: MoverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MoverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
