import { TestBed } from '@angular/core/testing';

import { SanctionsService } from './sanctions.service';

describe('SanctionsService', () => {
  let service: SanctionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SanctionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
