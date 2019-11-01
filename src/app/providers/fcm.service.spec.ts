import { TestBed } from '@angular/core/testing';

import { FcmService } from '../providers/fcm.service';

describe('FcmService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FcmService = TestBed.get(FcmService);
    expect(service).toBeTruthy();
  });
});
