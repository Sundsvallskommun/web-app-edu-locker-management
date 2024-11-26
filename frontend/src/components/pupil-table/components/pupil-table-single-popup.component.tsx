import { ContextMenu } from '@components/context-menu/context-menu.component';
import { Pupil } from '@data-contracts/backend/data-contracts';
import { Icon, PopupMenu } from '@sk-web-gui/react';
import { Lock, Unlink2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PupilTableSinglePopupProps {
  pupil: Pupil;
}

export const PupilTableSinglePopup: React.FC<PupilTableSinglePopupProps> = ({ pupil }) => {
  const { t } = useTranslation();

  const unassignAll =
    pupil.lockers?.length < 2 ?
      <></>
    : <>
        {pupil.lockers.map((locker) => (
          <PopupMenu.Item key={locker.lockerId}>
            <button data-test={`pupil-menu-unassign-${locker.lockerId}`}>
              <Icon icon={<Unlink2 />} />
              {t('pupils:unassign_named_locker_for_pupil', { locker: locker.lockerName })}
            </button>
          </PopupMenu.Item>
        ))}
        <PopupMenu.Item>
          <button data-test="pupil-menu-unassign-all">
            <Icon icon={<Unlink2 />} />
            {t(`pupils:unassign_locker_for_pupil_${pupil.lockers.length === 2 ? 'two' : 'other'}`)}
          </button>
        </PopupMenu.Item>
      </>;

  const unassignOne =
    pupil.lockers?.length !== 1 ?
      <></>
    : <PopupMenu.Item>
        <button data-test="pupil-menu-unassign-one">
          <Icon icon={<Unlink2 />} />
          {t('pupils:unassign_locker_for_pupil')}
        </button>
      </PopupMenu.Item>;

  const assign =
    pupil.lockers?.length > 0 ?
      <></>
    : <PopupMenu.Item>
        <button data-test="pupil-menu-assign">
          <Icon icon={<Lock />} />
          {t('pupils:assign_locker_to_pupil')}
        </button>
      </PopupMenu.Item>;

  return (
    <ContextMenu>
      {assign}
      {unassignOne}
      {unassignAll}
    </ContextMenu>
  );
};
