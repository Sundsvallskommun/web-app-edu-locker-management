import 'reflect-metadata';
import type { Response } from 'express';
import type { VerifyWithoutRequest } from '@node-saml/passport-saml';
import { samlStrategy } from '@/app';
import { SchoolController } from '@/controllers/school.controller';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { Profile } from '@/interfaces/profile.interface';
import { EmailService } from '@/services/email.service';
import ApiService from '@/services/api.service';

/**
 * Tests that downstream calls name the user who made them.
 *
 * Every call to WSO2 goes out on the same machine account, so `loginName` is the only
 * thing that ties a call to a person afterwards. Downstream APIs are mocked.
 */

const user = { username: 'kalle.karlsson', name: 'Kalle', givenName: 'Kalle', surname: 'Karlsson', schoolUnits: ['school-a'] };

const loginNamesOf = (calls: unknown[][]) => calls.map(([config]) => (config as { url: string; params?: { loginName?: string } }).params?.loginName);

describe('loginName on downstream calls', () => {
  afterEach(() => jest.restoreAllMocks());

  it('is sent on every call behind GET /schools, including the classes call', async () => {
    const get = jest.spyOn(ApiService.prototype, 'get').mockImplementation(async config => ({
      data: (config.url.endsWith('/schoolunits') ? [{ schoolId: 'school-a', schoolName: 'Skolan' }] : []) as never,
      message: 'success',
    }));
    const res = { send: jest.fn(body => body) } as unknown as Response;

    await new SchoolController().getMySchools({ user } as unknown as RequestWithUser, res);

    expect(get.mock.calls.map(([config]) => config.url)).toContainEqual(expect.stringContaining('/schools/school-a/classes'));
    expect(loginNamesOf(get.mock.calls)).toEqual(get.mock.calls.map(() => 'kalle.karlsson'));
  });

  it('is sent on every lookup behind a locker mail, including the school unit', async () => {
    const get = jest.spyOn(ApiService.prototype, 'get').mockImplementation(async config => ({
      data: (config.url.includes('/schoolunits/') ? { schoolId: 'school-a', schoolName: 'Skolan' } : { schoolId: 'school-a', name: '1' }) as never,
      message: 'success',
    }));
    const post = jest.spyOn(ApiService.prototype, 'post').mockResolvedValue({ data: {}, message: 'success' });

    await new EmailService().sendEmail({ pupilId: 'pupil-1', email: 'pupil@example.test', lockerIds: ['locker-1'] }, 'school-a', user);

    expect(get.mock.calls.map(([config]) => config.url)).toContainEqual(expect.stringContaining('/schoolunits/school-a'));
    expect(loginNamesOf(get.mock.calls)).toEqual(get.mock.calls.map(() => 'kalle.karlsson'));
    // The messaging API attributes a mail by this header instead of loginName.
    expect(post).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ headers: { 'X-Sent-By': 'kalle.karlsson' } }));
  });

  it('is sent on both lookups at login, including the citizen call with the personal number in the path', async () => {
    const get = jest.spyOn(ApiService.prototype, 'get').mockImplementation(async config => ({
      data: (config.url.endsWith('/guid') ? '4a7f1c2e-1111-2222-3333-9d8e7f6a5b4c' : ['school-a']) as never,
      message: 'success',
    }));
    const profile = {
      username: 'kalle.karlsson',
      givenName: 'Kalle',
      surname: 'Karlsson',
      citizenIdentifier: '199001011234',
      attributes: { groups: '' },
    } as unknown as Profile;
    const done = jest.fn();

    // The verify callback the strategy was built with, the one passport runs on a SAML login.
    await (samlStrategy._signonVerify as VerifyWithoutRequest)(profile, done);

    expect(done).toHaveBeenCalledWith(null, expect.objectContaining({ username: 'kalle.karlsson', schoolUnits: ['school-a'] }));
    expect(get.mock.calls.map(([config]) => config.url)).toEqual([expect.stringMatching(/\/guid$/), expect.stringMatching(/\/schoolids$/)]);
    expect(loginNamesOf(get.mock.calls)).toEqual(['kalle.karlsson', 'kalle.karlsson']);
  });
});
