import { APIS, MUNICIPALITY_ID } from '@/config';
import {
  PupilsLockerResponse,
  PupilsLockerResponseOrderBy,
  PupilsLockerResponsePagedOffsetResponse,
  SortDirection,
} from '@/data-contracts/pupillocker/data-contracts';
import { User } from '@/interfaces/users.interface';
import { deny, resolveOrDeny } from '@/utils/ownership';
import ApiService from './api.service';

/**
 * Who a notification may be sent to.
 *
 * Every notification path used to take both the pupil id and the recipient address
 * straight from the request body and hand them to the messaging API. The address was
 * never checked against the pupil, and the pupil was never checked against the
 * school - so an authenticated employee could mail anyone, from a municipal sender,
 * with free text. The messages carry locker location and the locker's active door
 * code, which makes a wrong or forged address a disclosure, not just a nuisance.
 *
 * The school's pupil register is the authority on a pupil's address. This service
 * loads it once per request and answers two questions: is this pupil at this school,
 * and what is their real address. The client's `email` field is no longer used as
 * anything but a value to be ignored.
 *
 * `pupilslocker/{schoolId}` has no personId filter, so the register is paged
 * through. Constraining the *query* by the client's value would be the wrong fix
 * anyway - the check is on the returned record's own identity.
 *
 * Construct one per request. routing-controllers keeps a single controller
 * instance for the life of the process, so a directory held as a controller field
 * would cache the register indefinitely and keep answering for pupils who have
 * since left the school.
 */

const PAGE_SIZE = 200;
/** Backstop against an unbounded loop if the API ever reports totalPages inconsistently. */
const MAX_PAGES = 50;

export class PupilDirectoryService {
  private readonly apiService = new ApiService();
  private readonly api = APIS.find(api => api.name === 'pupillocker');

  /** Cached for this instance's lifetime - one request - so notifying twenty pupils reads the register once. */
  private readonly cache = new Map<string, Promise<Map<string, PupilsLockerResponse>>>();

  public async forSchool(schoolId: string, user?: User): Promise<Map<string, PupilsLockerResponse>> {
    const cached = this.cache.get(schoolId);
    if (cached) return cached;

    const pending = this.load(schoolId, user);
    this.cache.set(schoolId, pending);
    return pending;
  }

  private async load(schoolId: string, user?: User): Promise<Map<string, PupilsLockerResponse>> {
    const pupils = new Map<string, PupilsLockerResponse>();

    for (let page = 1; page <= MAX_PAGES; page++) {
      const res = await resolveOrDeny(
        () =>
          this.apiService.get<PupilsLockerResponsePagedOffsetResponse>({
            url: `${this.api.name}/${this.api.version}/${MUNICIPALITY_ID}/pupilslocker/${schoolId}`,
            params: {
              loginName: user?.username,
              PageNumber: page,
              PageSize: PAGE_SIZE,
              OrderBy: PupilsLockerResponseOrderBy.PersonId,
              OrderDirection: SortDirection.ASC,
            },
          }),
        'school',
        schoolId,
        schoolId,
      );

      for (const pupil of res.data?.data ?? []) {
        if (pupil.personId) {
          pupils.set(pupil.personId, pupil);
        }
      }

      if (!res.data?.totalPages || page >= res.data.totalPages) break;
    }

    return pupils;
  }

  /**
   * Returns the pupil's own record, or denies. Never falls back to the caller's
   * value: a body field naming a recipient is an input to be verified, not a fact.
   */
  public async assertPupilAtSchool(schoolId: string, personId: string, user?: User): Promise<PupilsLockerResponse> {
    if (!personId) {
      deny('pupil', '', schoolId);
    }

    const pupils = await this.forSchool(schoolId, user);
    const pupil = pupils.get(personId);

    if (!pupil) {
      deny('pupil', personId, schoolId);
    }

    return pupil;
  }

  /**
   * The address the register holds for this pupil, or undefined when the register
   * has none. Callers report that as a delivery failure - the existing
   * "Email missing" outcome - rather than falling back to what the client sent.
   */
  public async resolveEmail(schoolId: string, personId: string, user?: User): Promise<string | undefined> {
    const pupil = await this.assertPupilAtSchool(schoolId, personId, user);
    return pupil.email ?? undefined;
  }
}

export default PupilDirectoryService;
