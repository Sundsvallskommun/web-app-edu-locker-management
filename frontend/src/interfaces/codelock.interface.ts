import { CodeLock } from '@data-contracts/backend/data-contracts';

export interface CodeLockForm extends Omit<CodeLock, 'activeCodeId'> {
  activeCodeId: string;
}
