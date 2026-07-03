import { Injectable, signal } from '@angular/core';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  readonly level: LogLevel;
  readonly source: string;
  readonly message: string;
  readonly timestamp: string;
  readonly data?: unknown;
}

@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  private readonly entriesSignal = signal<readonly LogEntry[]>([]);

  readonly entries = this.entriesSignal.asReadonly();

  debug(source: string, message: string, data?: unknown): void {
    this.write('debug', source, message, data);
  }

  info(source: string, message: string, data?: unknown): void {
    this.write('info', source, message, data);
  }

  warn(source: string, message: string, data?: unknown): void {
    this.write('warn', source, message, data);
  }

  error(source: string, message: string, data?: unknown): void {
    this.write('error', source, message, data);
  }

  private write(level: LogLevel, source: string, message: string, data?: unknown): void {
    const entry: LogEntry = {
      level,
      source,
      message,
      timestamp: new Date().toISOString(),
      data,
    };

    this.entriesSignal.update((entries) => [entry, ...entries].slice(0, 10));
    console[level](`[${source}] ${message}`, data ?? '');
  }
}
