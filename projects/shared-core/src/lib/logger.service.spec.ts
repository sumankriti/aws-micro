import { TestBed } from '@angular/core/testing';

import { LoggerService } from './logger.service';

describe('LoggerService', () => {
  let service: LoggerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoggerService);
  });

  it('should keep recent log entries', () => {
    service.info('test', 'message', { id: 1 });

    const [entry] = service.entries();

    expect(entry.source).toBe('test');
    expect(entry.message).toBe('message');
    expect(entry.level).toBe('info');
    expect(entry.data).toEqual({ id: 1 });
  });
});
