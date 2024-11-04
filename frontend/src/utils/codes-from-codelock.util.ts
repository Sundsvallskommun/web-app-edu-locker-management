import { CodeLock } from '@data-contracts/backend/data-contracts';
import { Codes } from '@interfaces/code.interface';

export const codesFromCodeLock = (codeLock: CodeLock): Codes => {
  const codeKeys = ['code1', 'code2', 'code3', 'code4', 'code5'];
  return Object.keys(codeLock).reduce((codes, key) => {
    if (codeKeys.includes(key)) {
      return [...codes, { codeNr: parseInt(key.replace('code', ''), 10), code: codeLock[key] }];
    } else {
      return codes;
    }
  }, []);
};
