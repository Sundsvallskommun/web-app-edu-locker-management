import 'reflect-metadata';
import type { Response } from 'express';
import { LockerController } from '@/controllers/locker.controller';
import { NoticeController } from '@/controllers/notice.controller';
import { EditLockerBody, LockerAssignBody, UnassignLockerBody } from '@/dtos/locker.dto';
import { NoticeDto } from '@/dtos/notice.dto';
import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { EmailService } from '@/services/email.service';
import { PupilDirectoryService } from '@/services/pupil-directory.service';
import { maskIdentifier, resolveOrDeny, statusOf } from '@/utils/ownership';
import ApiService from '@/services/api.service';
import { afterEach, beforeEach, describe, expect, it, MockInstance, vi } from 'vitest';

/**
 * Tests that locker mails, which contain door codes, only go to the right pupil.
 *
 * The pupil id in a request body decides who gets the mail, and neither
 * `authMiddleware` nor `schoolMiddleware` checks it. These tests cover that check.
 * All downstream APIs are mocked.
 */

const pupilPage = (pupils: { personId: string; email?: string | null; lockers?: { lockerId: string }[] }[], totalPages = 1) => ({
  data: { data: pupils, pageNumber: 1, pageSize: 200, totalPages, totalRecords: pupils.length },
  message: 'success',
});

const user = { username: 'kalle.karlsson', name: 'Kalle', givenName: 'Kalle', surname: 'Karlsson', schoolUnits: ['school-a'] };

describe('statusOf', () => {
  /** routing-controllers changes the error's prototype, so `instanceof` can't be used. See `statusOf`. */
  it('reads the status off an error whose prototype was re-pointed', () => {
    const error = new HttpException(404, 'Not found');
    Object.setPrototypeOf(error, Object.prototype);

    expect(error).not.toBeInstanceOf(HttpException);
    expect(statusOf(error)).toBe(404);
  });

  it('reads httpCode as well as status', () => {
    expect(statusOf({ httpCode: 403 })).toBe(403);
  });

  it('returns undefined for anything without a numeric status', () => {
    expect(statusOf(new Error('boom'))).toBeUndefined();
    expect(statusOf({ status: 'nope' })).toBeUndefined();
    expect(statusOf(null)).toBeUndefined();
  });
});

describe('maskIdentifier', () => {
  it('keeps enough to investigate with and not enough to rebuild a register', () => {
    expect(maskIdentifier('4a7f1c2e-1111-2222-3333-9d8e7f6a5b4c')).toBe('4a7f***5b4c');
  });

  it('reveals nothing at all about a short value', () => {
    expect(maskIdentifier('12345678')).toBe('***');
    expect(maskIdentifier(undefined)).toBe('<none>');
    expect(maskIdentifier('')).toBe('<none>');
  });
});

describe('resolveOrDeny', () => {
  it('answers 403 for a missing object, so the endpoint is not an oracle for which ids exist', async () => {
    const load = () => Promise.reject(new HttpException(404, 'Not found'));

    await expect(resolveOrDeny(load, 'pupil', 'p1', 'school-a')).rejects.toMatchObject({ status: 403 });
  });

  it('answers 403 for a forbidden object, identically', async () => {
    const load = () => Promise.reject(new HttpException(403, 'Forbidden'));

    await expect(resolveOrDeny(load, 'pupil', 'p1', 'school-a')).rejects.toMatchObject({ status: 403 });
  });

  it('lets an unrelated failure through rather than disguising it as a denial', async () => {
    const load = () => Promise.reject(new HttpException(500, 'Gateway exploded'));

    await expect(resolveOrDeny(load, 'pupil', 'p1', 'school-a')).rejects.toMatchObject({ status: 500 });
  });

  it('returns the object when it loads', async () => {
    await expect(resolveOrDeny(() => Promise.resolve('value'), 'pupil', 'p1', 'school-a')).resolves.toBe('value');
  });
});

describe('PupilDirectoryService', () => {
  let get: MockInstance;

  beforeEach(() => {
    get = vi.spyOn(ApiService.prototype, 'get');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns the pupil when the id names someone at the school', async () => {
    get.mockResolvedValue(pupilPage([{ personId: 'pupil-1', email: 'pupil.one@example.test' }]));

    const pupil = await new PupilDirectoryService().assertPupilAtSchool('school-a', 'pupil-1', user);

    expect(pupil.email).toBe('pupil.one@example.test');
  });

  it('denies with 403 when the id names a pupil at another school', async () => {
    get.mockResolvedValue(pupilPage([{ personId: 'pupil-1', email: 'pupil.one@example.test' }]));

    await expect(new PupilDirectoryService().assertPupilAtSchool('school-a', 'pupil-from-school-b', user)).rejects.toMatchObject({
      status: 403,
      message: 'MISSING_PERMISSIONS',
    });
  });

  it('denies with 403 when the pupil does not exist, indistinguishably from the foreign case', async () => {
    get.mockResolvedValue(pupilPage([]));

    await expect(new PupilDirectoryService().assertPupilAtSchool('school-a', 'no-such-pupil', user)).rejects.toMatchObject({
      status: 403,
      message: 'MISSING_PERMISSIONS',
    });
  });

  it('finds nothing, rather than denying, for an id not at the school', async () => {
    get.mockResolvedValue(pupilPage([{ personId: 'pupil-1', email: 'pupil.one@example.test' }]));

    await expect(new PupilDirectoryService().findPupil('school-a', 'pupil-from-school-b', user)).resolves.toBeUndefined();
  });

  it('denies with 403 when no pupil id was supplied at all', async () => {
    get.mockResolvedValue(pupilPage([]));

    await expect(new PupilDirectoryService().assertPupilAtSchool('school-a', '', user)).rejects.toMatchObject({ status: 403 });
  });

  it('returns the address the register holds', async () => {
    get.mockResolvedValue(pupilPage([{ personId: 'pupil-1', email: 'real.address@example.test' }]));

    const pupil = await new PupilDirectoryService().assertPupilAtSchool('school-a', 'pupil-1', user);

    expect(pupil.email).toBe('real.address@example.test');
  });

  it('returns no address when the register holds none', async () => {
    get.mockResolvedValue(pupilPage([{ personId: 'pupil-1', email: null }]));

    const pupil = await new PupilDirectoryService().assertPupilAtSchool('school-a', 'pupil-1', user);

    expect(pupil.email).toBeNull();
  });

  it('reads the whole register, so a pupil on a later page is still found', async () => {
    get
      .mockResolvedValueOnce(pupilPage([{ personId: 'pupil-1', email: 'one@example.test' }], 2))
      .mockResolvedValueOnce(pupilPage([{ personId: 'pupil-2', email: 'two@example.test' }], 2));

    const pupil = await new PupilDirectoryService().findPupil('school-a', 'pupil-2', user);

    expect(pupil?.email).toBe('two@example.test');
    expect(get).toHaveBeenCalledTimes(2);
  });

  it('reads the register once per instance, however many pupils are checked', async () => {
    get.mockResolvedValue(
      pupilPage([
        { personId: 'pupil-1', email: 'one@example.test' },
        { personId: 'pupil-2', email: 'two@example.test' },
      ]),
    );

    const directory = new PupilDirectoryService();
    await directory.assertPupilAtSchool('school-a', 'pupil-1', user);
    await directory.assertPupilAtSchool('school-a', 'pupil-2', user);

    expect(get).toHaveBeenCalledTimes(1);
  });

  it('scopes the lookup to the school in the path', async () => {
    get.mockResolvedValue(pupilPage([{ personId: 'pupil-1' }]));

    await new PupilDirectoryService().assertPupilAtSchool('school-a', 'pupil-1', user);

    expect(get).toHaveBeenCalledWith(expect.objectContaining({ url: expect.stringContaining('/pupilslocker/school-a') }));
  });

  it('names the acting user downstream, so the call is attributable', async () => {
    get.mockResolvedValue(pupilPage([{ personId: 'pupil-1' }]));

    await new PupilDirectoryService().assertPupilAtSchool('school-a', 'pupil-1', user);

    expect(get).toHaveBeenCalledWith(expect.objectContaining({ params: expect.objectContaining({ loginName: 'kalle.karlsson' }) }));
  });

  it('turns a downstream 404 for the school into the same 403, not a 404', async () => {
    get.mockRejectedValue(new HttpException(404, 'Not found'));

    await expect(new PupilDirectoryService().assertPupilAtSchool('school-a', 'pupil-1', user)).rejects.toMatchObject({ status: 403 });
  });
});

/**
 * Assign refuses before anything changes, since the pupil is part of the assignment.
 * Unassign and update never refuse because of the pupil: the change always goes
 * through, and the mail goes to the register's address or to nobody.
 */
describe('LockerController', () => {
  let get: MockInstance;
  let patch: MockInstance;
  let sendEmail: MockInstance;

  const req = { user } as unknown as RequestWithUser;
  const res = () => ({ send: vi.fn(body => body) }) as unknown as Response;

  beforeEach(() => {
    get = vi.spyOn(ApiService.prototype, 'get').mockResolvedValue(pupilPage([{ personId: 'pupil-1', email: 'register@example.test' }]));
    patch = vi.spyOn(ApiService.prototype, 'patch');
    sendEmail = vi.spyOn(EmailService.prototype, 'sendEmail').mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('denies an assignment naming a pupil from another school, and leaves the locker unassigned', async () => {
    const body = { data: [{ personId: 'pupil-from-school-b', lockerId: 'locker-1' }] } as unknown as LockerAssignBody;

    await expect(new LockerController().assignLockers(req, 'school-a', true, body, res())).rejects.toMatchObject({ status: 403 });
    expect(patch).not.toHaveBeenCalled();
  });

  it('refuses the same locker twice in one assignment, and assigns nothing', async () => {
    get.mockResolvedValue(
      pupilPage([
        { personId: 'pupil-1', email: 'one@example.test' },
        { personId: 'pupil-2', email: 'two@example.test' },
      ]),
    );
    const body = {
      data: [
        { personId: 'pupil-1', lockerId: 'locker-1' },
        { personId: 'pupil-2', lockerId: 'locker-1' },
      ],
    } as unknown as LockerAssignBody;

    await expect(new LockerController().assignLockers(req, 'school-a', true, body, res())).rejects.toMatchObject({ status: 400 });
    expect(patch).not.toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('mails the register address on assignment, not the one in the body', async () => {
    patch.mockResolvedValue({ data: { successfulLockers: [{ lockerId: 'locker-1' }] } });
    const body = { data: [{ personId: 'pupil-1', lockerId: 'locker-1', email: 'forged@example.test' }] } as unknown as LockerAssignBody;

    await new LockerController().assignLockers(req, 'school-a', true, body, res());

    expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({ email: 'register@example.test' }), 'school-a', user);
  });

  /** A pupil who has left is no longer in the register, but their locker still has to be released. */
  it('releases a locker held by a pupil not in the register, and mails nobody', async () => {
    patch.mockResolvedValue({ data: { successfulLockerIds: ['locker-1'] } });
    const body = {
      status: 'Ledig',
      lockers: [{ lockerId: 'locker-1', pupilId: 'pupil-who-left', email: 'forged@example.test' }],
    } as unknown as UnassignLockerBody;

    const result = await new LockerController().unassignLockers(req, 'school-a', true, body, res());

    expect(patch).toHaveBeenCalledTimes(1);
    expect(sendEmail).not.toHaveBeenCalled();
    expect(result).toMatchObject({ data: { failedNoticedPupils: [{ pupilId: 'pupil-who-left', reason: 'Email missing' }] } });
  });

  it('mails the register address on unassignment, not the one in the body', async () => {
    patch.mockResolvedValue({ data: { successfulLockerIds: ['locker-1'] } });
    get
      .mockResolvedValueOnce(pupilPage([{ personId: 'pupil-1', email: 'register@example.test' }]))
      .mockResolvedValueOnce({ data: { name: 'Skåp 1' } });
    const body = {
      status: 'Ledig',
      lockers: [{ lockerId: 'locker-1', pupilId: 'pupil-1', email: 'forged@example.test' }],
    } as unknown as UnassignLockerBody;

    await new LockerController().unassignLockers(req, 'school-a', true, body, res());

    expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({ email: 'register@example.test' }), 'school-a', user);
  });

  it('still releases the locker when the register cannot be read', async () => {
    patch.mockResolvedValue({ data: { successfulLockerIds: ['locker-1'] } });
    get.mockRejectedValue(new HttpException(500, 'Gateway exploded'));
    const body = { status: 'Ledig', lockers: [{ lockerId: 'locker-1', pupilId: 'pupil-1' }] } as unknown as UnassignLockerBody;

    const result = await new LockerController().unassignLockers(req, 'school-a', true, body, res());

    expect(sendEmail).not.toHaveBeenCalled();
    expect(result).toMatchObject({ data: { failedNoticedPupils: [{ pupilId: 'pupil-1', reason: 'Server error' }] } });
  });

  it('saves an edit to a locker held by a pupil not in the register, and mails nobody', async () => {
    patch.mockResolvedValue({ data: null });
    const body = { status: 'Tilldelad', name: 'Skåp 1b', pupilId: 'pupil-who-left', pupilEmail: 'forged@example.test' } as unknown as EditLockerBody;

    const result = await new LockerController().updateLocker(req, 'school-a', 'locker-1', true, body, res());

    expect(patch).toHaveBeenCalledTimes(1);
    expect(sendEmail).not.toHaveBeenCalled();
    expect(result).toMatchObject({ data: { noticed: false, noticeFailReason: 'Email missing' } });
  });

  it('mails the register address on an edit, not the one in the body', async () => {
    get.mockResolvedValue(pupilPage([{ personId: 'pupil-1', email: 'register@example.test', lockers: [{ lockerId: 'locker-1' }] }]));
    patch.mockResolvedValue({ data: null });
    const body = { status: 'Tilldelad', pupilId: 'pupil-1', pupilEmail: 'forged@example.test' } as unknown as EditLockerBody;

    await new LockerController().updateLocker(req, 'school-a', 'locker-1', true, body, res());

    expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({ email: 'register@example.test' }), 'school-a', user);
  });

  it("does not mail a locker's door code to a pupil at the school who does not hold it", async () => {
    get.mockResolvedValue(pupilPage([{ personId: 'pupil-1', email: 'register@example.test', lockers: [{ lockerId: 'locker-2' }] }]));
    patch.mockResolvedValue({ data: null });
    const body = { status: 'Tilldelad', pupilId: 'pupil-1' } as unknown as EditLockerBody;

    const result = await new LockerController().updateLocker(req, 'school-a', 'locker-1', true, body, res());

    expect(patch).toHaveBeenCalledTimes(1);
    expect(sendEmail).not.toHaveBeenCalled();
    expect(result).toMatchObject({ data: { noticed: false, noticeFailReason: 'Email missing' } });
  });

  it('does not consult the register when no notice is asked for, on unassign', async () => {
    patch.mockResolvedValue({ data: { successfulLockerIds: ['locker-1'] } });
    const body = { status: 'Ledig', lockers: [{ lockerId: 'locker-1', pupilId: 'pupil-from-school-b' }] } as unknown as UnassignLockerBody;

    await new LockerController().unassignLockers(req, 'school-a', false, body, res());

    expect(get).not.toHaveBeenCalled();
    expect(patch).toHaveBeenCalledTimes(1);
  });
});

/**
 * POST /notice exists to send a pupil their lockers' details, door codes included.
 * The email service only checks that a locker belongs to the school, so the pupil
 * and every locker have to be checked here.
 */
describe('NoticeController', () => {
  let sendEmail: MockInstance;

  const req = { user } as unknown as RequestWithUser;
  const res = () => ({ status: vi.fn().mockReturnThis(), send: vi.fn() }) as unknown as Response;
  const notice = (lockerIds: string[]) => ({ pupilId: 'pupil-1', email: 'forged@example.test', message: 'Hej', lockerIds }) as unknown as NoticeDto;

  beforeEach(() => {
    vi.spyOn(ApiService.prototype, 'get').mockResolvedValue(
      pupilPage([{ personId: 'pupil-1', email: 'register@example.test', lockers: [{ lockerId: 'locker-1' }] }]),
    );
    sendEmail = vi.spyOn(EmailService.prototype, 'sendEmail').mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sends the pupil's own lockers to the register address, not the one in the body", async () => {
    await new NoticeController().createLockers(req, 'school-a', false, notice(['locker-1']), res());

    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'register@example.test', lockerIds: ['locker-1'] }),
      'school-a',
      user,
      false,
    );
  });

  it("denies sending a pupil another pupil's locker, and sends nothing", async () => {
    await expect(new NoticeController().createLockers(req, 'school-a', false, notice(['locker-1', 'locker-2']), res())).rejects.toMatchObject({
      status: 403,
      message: 'MISSING_PERMISSIONS',
    });
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('denies a pupil from another school, and sends nothing', async () => {
    const body = { ...notice([]), pupilId: 'pupil-from-school-b' } as NoticeDto;

    await expect(new NoticeController().createLockers(req, 'school-a', false, body, res())).rejects.toMatchObject({ status: 403 });
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('sends a message without lockers to a pupil at the school', async () => {
    await new NoticeController().createLockers(req, 'school-a', false, notice([]), res());

    expect(sendEmail).toHaveBeenCalledTimes(1);
  });
});
