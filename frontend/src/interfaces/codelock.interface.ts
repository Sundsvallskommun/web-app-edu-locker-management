import { CodeLock } from '@data-contracts/backend/data-contracts';

export interface CodeLockForm extends Omit<CodeLock, 'activeCodeId'> {
  activeCodeId: string;
}

export type CodeId = keyof Omit<CodeLock, 'activeCodeId' | 'codeLockId' | 'activeCodeId'>;
export type CodeIdMap = Record<number, CodeId>;

export const codeIds: CodeIdMap = {
  1: 'code1',
  2: 'code2',
  3: 'code3',
  4: 'code4',
  5: 'code5',
};
