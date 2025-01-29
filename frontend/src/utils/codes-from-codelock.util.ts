import { CodeLock } from '@data-contracts/backend/data-contracts';
import { Code, Codes } from '@interfaces/code.interface';

export const codesFromCodeLock = (codeLock: CodeLock): Codes => {
  const codeKeys: string[] = ['code1', 'code2', 'code3', 'code4', 'code5'];
  const lockKeys: Array<keyof CodeLock> = Object.keys(codeLock) as Array<keyof CodeLock>;
  return lockKeys.reduce<Codes>((codes, key) => {
    if (!key) return codes;

    if (codeKeys.includes(key) && typeof codeLock?.[key] === 'string') {
      const code: Code = {
        codeNr: parseInt(key.replace('code', ''), 10),
        code: codeLock?.[key],
      };
      return [...codes, code];
    } else {
      return codes;
    }
  }, []);
};
