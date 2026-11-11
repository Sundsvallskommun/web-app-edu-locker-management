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
 * Looks up pupils in the school's pupil register, to decide who a locker mail may go to.
 *
 * Locker mails contain the locker's location and door code. So the recipient is never
 * taken from the request: the register says whether the pupil is at this school, what
 * their email address is, and which lockers they hold.
 *
 * The register API cannot look up a single pupil, so the whole register is read, page
 * by page, and kept for the rest of the request.
 *
 * Create a new instance per request. Controllers live as long as the process, so an
 * instance kept on a controller would keep serving an outdated register.
 */

const PAGE_SIZE = 200;
/** Stops the loop if the API ever reports the wrong number of pages. */
const MAX_PAGES = 50;

/** Whether the register lists this locker as the pupil's. Required before mailing them its door code. */
export const holdsLocker = (pupil: PupilsLockerResponse | undefined, lockerId: string): boolean =>
  !!lockerId && !!pupil?.lockers?.some(locker => locker.lockerId === lockerId);

export class PupilDirectoryService {
  private readonly apiService = new ApiService();
  private readonly api = APIS.find(api => api.name === 'pupillocker');

  /** One register read per school per request, however many pupils are looked up. */
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
   * The pupil's register entry, or undefined if they are not at this school.
   * Use where an unknown pupil should just mean no mail. Use `assertPupilAtSchool`
   * where it should stop the request.
   */
  public async findPupil(schoolId: string, personId: string, user?: User): Promise<PupilsLockerResponse | undefined> {
    if (!personId) return undefined;

    const pupils = await this.forSchool(schoolId, user);
    return pupils.get(personId);
  }

  /** The pupil's register entry, or a 403 if they are not at this school. */
  public async assertPupilAtSchool(schoolId: string, personId: string, user?: User): Promise<PupilsLockerResponse> {
    if (!personId) {
      deny('pupil', '', schoolId);
    }

    const pupil = await this.findPupil(schoolId, personId, user);

    if (!pupil) {
      deny('pupil', personId, schoolId);
    }

    return pupil;
  }
}

export default PupilDirectoryService;
