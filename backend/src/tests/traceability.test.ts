import 'reflect-metadata';
import type { Response } from 'express';
import { SchoolController } from '@/controllers/school.controller';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { EmailService } from '@/services/email.service';
import ApiService from '@/services/api.service';
import { afterEach, describe, expect, it, vi } from 'vitest';

/**
 * Tests that downstream calls name the user who made them.
 *
 * Every call to WSO2 goes out on the same machine account, so `loginName` is the only
 * thing that ties a call to a person afterwards. Downstream APIs are mocked.
 */

const user = { username: 'kalle.karlsson', name: 'Kalle', givenName: 'Kalle', surname: 'Karlsson', schoolUnits: ['school-a'] };

const loginNamesOf = (calls: unknown[][]) => calls.map(([config]) => (config as { url: string; params?: { loginName?: string } }).params?.loginName);

describe('loginName on downstream calls', () => {
  afterEach(() => vi.restoreAllMocks());

  it('is sent on every call behind GET /schools, including the classes call', async () => {
    const get = vi.spyOn(ApiService.prototype, 'get').mockImplementation(async config => ({
      data: (config.url.endsWith('/schoolunits') ? [{ schoolId: 'school-a', schoolName: 'Skolan' }] : []) as never,
      message: 'success',
    }));
    const res = { send: vi.fn(body => body) } as unknown as Response;

    await new SchoolController().getMySchools({ user } as unknown as RequestWithUser, res);

    expect(get.mock.calls.map(([config]) => config.url)).toContainEqual(expect.stringContaining('/schools/school-a/classes'));
    expect(loginNamesOf(get.mock.calls)).toEqual(get.mock.calls.map(() => 'kalle.karlsson'));
  });

  it('is sent on every lookup behind a locker mail, including the school unit', async () => {
    const get = vi.spyOn(ApiService.prototype, 'get').mockImplementation(async config => ({
      data: (config.url.includes('/schoolunits/') ? { schoolId: 'school-a', schoolName: 'Skolan' } : { schoolId: 'school-a', name: '1' }) as never,
      message: 'success',
    }));
    const post = vi.spyOn(ApiService.prototype, 'post').mockResolvedValue({ data: {}, message: 'success' });

    await new EmailService().sendEmail({ pupilId: 'pupil-1', email: 'pupil@example.test', lockerIds: ['locker-1'] }, 'school-a', user);

    expect(get.mock.calls.map(([config]) => config.url)).toContainEqual(expect.stringContaining('/schoolunits/school-a'));
    expect(loginNamesOf(get.mock.calls)).toEqual(get.mock.calls.map(() => 'kalle.karlsson'));
    // The messaging API attributes a mail by this header instead of loginName.
    expect(post).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ headers: { 'X-Sent-By': 'kalle.karlsson' } }));
  });
});
