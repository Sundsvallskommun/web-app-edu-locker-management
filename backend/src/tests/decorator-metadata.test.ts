import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import { LockerController } from '@/controllers/locker.controller';
import { LockerAssignBody } from '@/dtos/locker.dto';

/** routing-controllers needs emitDecoratorMetadata, which here comes from Vite's transform, not tsc. */
describe('decorator metadata', () => {
  it('records the body type of a controller action', () => {
    const types = Reflect.getMetadata('design:paramtypes', LockerController.prototype, 'assignLockers');

    expect(types).toContain(LockerAssignBody);
  });
});
