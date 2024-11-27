import { ContextMenu } from '@components/context-menu/context-menu.component';
import { Pupil } from '@data-contracts/backend/data-contracts';
import { Icon, PopupMenu } from '@sk-web-gui/react';
import { Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PupilTableMultiplePopupProps {
  pupils: Pupil[];
  onUnassign: (pupils: Pupil[]) => void;
  onAssign: (pupils: Pupil[]) => void;
}

export const PupilTableMultiplePopup: React.FC<PupilTableMultiplePopupProps> = ({ pupils, onUnassign, onAssign }) => {
  const { t } = useTranslation();
  const free_pupils = [...pupils].filter((pupil) => pupil && (!pupil?.lockers || pupil.lockers.length < 1));
  const assigned_pupils = [...pupils].filter((pupil) => pupil && pupil?.lockers && pupil.lockers.length > 0);

  const assign =
    free_pupils.length === 0 ?
      <></>
    : <PopupMenu.Item>
        <button data-test="pupil-menu-multi-assign" onClick={() => onAssign(free_pupils)}>
          <Icon icon={<Lock />} />
          {t('pupils:assign_lockers_to', { pupil: t('pupils:count', { count: free_pupils.length }) })}
        </button>
      </PopupMenu.Item>;

  const unassign =
    assigned_pupils.length === 0 ?
      <></>
    : <PopupMenu.Item>
        <button data-test="pupil-menu-multi-unassign" onClick={() => onUnassign(assigned_pupils)}>
          <Icon icon={<Lock />} />
          {t('pupils:unassign_lockers_for', { pupil: t('pupils:count', { count: assigned_pupils.length }) })}
        </button>
      </PopupMenu.Item>;

  return (
    <ContextMenu disabled={!pupils || pupils.length < 1}>
      {assign}
      {unassign}
    </ContextMenu>
  );
};
