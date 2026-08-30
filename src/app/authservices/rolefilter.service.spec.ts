import { TestBed } from '@angular/core/testing';

import { RolefilterService } from './rolefilter.service';

describe('RolefilterService', () => {
  let service: RolefilterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RolefilterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
