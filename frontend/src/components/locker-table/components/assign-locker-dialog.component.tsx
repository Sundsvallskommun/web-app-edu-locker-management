import { Pupil, SchoolLocker } from '@data-contracts/backend/data-contracts';
import { SchoolLockerForm } from '@interfaces/locker.interface';
import { useCodeLock } from '@services/codelock-service';
import { useLockers } from '@services/locker-service';
import { useFreePupils } from '@services/pupil-service';
import { Button, Dialog, Divider, FormControl, FormLabel, RadioButton, SearchField, Select } from '@sk-web-gui/react';
import { codesFromCodeLock } from '@utils/codes-from-codelock.util';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { capitalize } from 'underscore.string';

interface AssignLockerDialogProps {
  locker: SchoolLocker | SchoolLockerForm;
  show: boolean;
  onClose: () => void;
  onAssign?: (pupil: Pupil) => void;
  showCode?: boolean;
}

export const AssignLockerDialog: React.FC<AssignLockerDialogProps> = ({
  locker,
  show,
  onClose,
  onAssign,
  showCode = true,
}) => {
  const [updated, setUpdated] = useState<boolean>(false);

  const { t } = useTranslation();
  const { schoolUnit, refresh, assign } = useLockers();

  const [query, setQuery] = useState<string>('');
  const [selectedPupil, setSelectedPupil] = useState<string>('');

  const pupils = useFreePupils(schoolUnit, query);

  const { data: codelock, update: updateCodeLock } = useCodeLock(schoolUnit, locker?.codeLockId);

  const setSelectedCode = (codeNr: string) => {
    const activeCodeId = parseInt(codeNr, 10);
    updateCodeLock({ activeCodeId, code1: null, code2: null, code3: null, code4: null, code5: null });
    setUpdated(true);
  };

  const handleClose = () => {
    setQuery('');
    setSelectedPupil('');
    if (updated) {
      refresh();
    }
    onClose();
  };

  const handleAssign = () => {
    if (onAssign) {
      const pupil = selectedPupil ? pupils.find((pupil) => pupil.personId === selectedPupil) : undefined;
      onAssign(pupil);
      handleClose();
    } else {
      assign([{ lockerId: locker.lockerId, personId: selectedPupil }]).then((res) => {
        if (res) {
          handleClose();
        }
      });
    }
  };

  const codes = !codelock ? undefined : codesFromCodeLock(codelock);

  return (
    <Dialog
      show={show}
      hideClosebutton={false}
      disableCloseOutside={false}
      label={t('lockers:assign_locker_to_pupil')}
      onClose={handleClose}
      data-test="assign-locker-dialog"
    >
      <Dialog.Content className="gap-24">
        <header>
          <h1 className="text-h2-sm md:text-h2-md xl:text-h2-lg m-0 p-0">{locker?.name}</h1>
        </header>

        <FormControl className="w-full grow">
          <FormLabel>{t('common:search_resource', { resource: t('pupils:name') })}</FormLabel>
          <SearchField
            showSearchButton={false}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full grow"
            onReset={() => setQuery('')}
            data-test="assign-search-pupil"
          />
        </FormControl>
        {pupils?.length > 0 && (
          <>
            <Divider />
            <FormControl fieldset className="w-full grow">
              <FormLabel>{t('lockers:assign_pupil')}</FormLabel>
              <ul className="max-h-[20rem] overflow-y-auto w-full grow flex flex-col gap-12">
                {pupils.map((pupil) => (
                  <li key={pupil.personId}>
                    <RadioButton
                      checked={selectedPupil === pupil.personId}
                      name="assign_pupil"
                      value={pupil.personId}
                      onChange={() => setSelectedPupil(pupil.personId)}
                    >
                      {pupil.name} ({pupil.className})
                    </RadioButton>
                  </li>
                ))}
              </ul>
            </FormControl>
          </>
        )}
        <Divider />
        {showCode && locker?.lockType?.toLowerCase() === 'kodlås' && codes && (
          <FormControl className="w-full grow">
            <FormLabel>{t('codelocks:code_on_lock', { lock: codelock.codeLockId })}</FormLabel>
            <Select
              className="w-full grow"
              value={codelock.activeCodeId.toString()}
              onChange={(e) => setSelectedCode(e.target.value)}
            >
              {codes.map((code, index) => (
                <Select.Option key={`code-${index}`} value={code.codeNr.toString()}>
                  {capitalize(t('codelocks:code'))} {code.codeNr} - {code.code}
                </Select.Option>
              ))}
            </Select>
          </FormControl>
        )}
      </Dialog.Content>
      <Dialog.Buttons className="justify-evenly">
        <Button variant="secondary" onClick={() => handleClose()} className="w-auto grow">
          {capitalize(t('common:cancel'))}
        </Button>
        <Button
          disabled={!selectedPupil}
          variant="primary"
          color="vattjom"
          onClick={() => handleAssign()}
          className="w-auto grow"
          data-test="assign-pupil-submit"
        >
          {capitalize(t('lockers:assign_locker'))}
        </Button>
      </Dialog.Buttons>
    </Dialog>
  );
};
