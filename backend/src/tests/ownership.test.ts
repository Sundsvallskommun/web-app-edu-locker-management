import 'reflect-metadata';
import { HttpException } from '@/exceptions/HttpException';
import { PupilDirectoryService } from '@/services/pupil-directory.service';
import { maskIdentifier, resolveOrDeny, statusOf } from '@/utils/ownership';
import ApiService from '@/services/api.service';

/**
 * Ownership: may this session act for *this* pupil?
 *
 * `authMiddleware` proves a session exists and `schoolMiddleware` proves the caller
 * may act for the school in the path. Neither looks at a pupil id in the request
 * body - and that id decided who received a mail containing a locker's location and
 * its active door code. These tests cover the decision, not the transport, so the
 * API service is mocked throughout.
 */

const pupilPage = (pupils: { personId: string; email?: string | null }[], totalPages = 1) => ({
  data: { data: pupils, pageNumber: 1, pageSize: 200, totalPages, totalRecords: pupils.length },
  message: 'success',
});

const user = { username: 'kalle.karlsson', name: 'Kalle', givenName: 'Kalle', surname: 'Karlsson', schoolUnits: ['school-a'] };

describe('statusOf', () => {
  /**
   * routing-controllers' HttpError re-points its prototype in the constructor, so
   * `instanceof` is always false. A check written that way compiles, runs, and never
   * denies - which is exactly the failure this helper exists to avoid.
   */
  it('reads the status off an error whose prototype was re-pointed', () => {
    const error = new HttpException(404, 'Not found');
    Object.setPrototypeOf(error, Object.prototype);

    expect(error instanceof HttpException).toBe(false);
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
  let get: jest.SpyInstance;

  beforeEach(() => {
    get = jest.spyOn(ApiService.prototype, 'get');
  });

  afterEach(() => {
    jest.restoreAllMocks();
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

  it('denies with 403 when no pupil id was supplied at all', async () => {
    get.mockResolvedValue(pupilPage([]));

    await expect(new PupilDirectoryService().assertPupilAtSchool('school-a', '', user)).rejects.toMatchObject({ status: 403 });
  });

  it('resolves the address from the register, never from what a caller supplied', async () => {
    get.mockResolvedValue(pupilPage([{ personId: 'pupil-1', email: 'real.address@example.test' }]));

    const email = await new PupilDirectoryService().resolveEmail('school-a', 'pupil-1', user);

    expect(email).toBe('real.address@example.test');
  });

  it('reports no address rather than falling back, when the register holds none', async () => {
    get.mockResolvedValue(pupilPage([{ personId: 'pupil-1', email: null }]));

    await expect(new PupilDirectoryService().resolveEmail('school-a', 'pupil-1', user)).resolves.toBeUndefined();
  });

  it('reads the whole register, so a pupil on a later page is not treated as foreign', async () => {
    get
      .mockResolvedValueOnce(pupilPage([{ personId: 'pupil-1', email: 'one@example.test' }], 2))
      .mockResolvedValueOnce(pupilPage([{ personId: 'pupil-2', email: 'two@example.test' }], 2));

    const email = await new PupilDirectoryService().resolveEmail('school-a', 'pupil-2', user);

    expect(email).toBe('two@example.test');
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
