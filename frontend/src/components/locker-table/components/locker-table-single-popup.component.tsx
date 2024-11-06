import { ContextMenu } from '@components/context-menu/context-menu.component';
import { SchoolLocker } from '@data-contracts/backend/data-contracts';
import { LockerStatus } from '@interfaces/locker.interface';
import { useLockers } from '@services/locker-service';
import { Icon, PopupMenu, useConfirm } from '@sk-web-gui/react';
import { CheckCircle, IterationCw, Lock, Settings, Trash2, Unlink2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { capitalize } from 'underscore.string';

interface LockerTableSinglePopupProps {
  locker: SchoolLocker;
  onUnassign: (locker: SchoolLocker) => void;
  onAssign: (locker: SchoolLocker) => void;
  onEdit: (locker: SchoolLocker) => void;
}

export const LockerTableSinglePopup: React.FC<LockerTableSinglePopupProps> = ({
  locker,
  onUnassign,
  onAssign,
  onEdit,
}) => {
  const { t } = useTranslation();

  const { showConfirmation } = useConfirm();
  const { refresh, removeLocker, updateStatus } = useLockers();
  const handleDeleteLocker = () => {
    showConfirmation(
      capitalize(t('lockers:remove_locker_with_number', { locker: locker.name })),
      capitalize(t('common:cant_be_undone')),
      capitalize(t('lockers:remove_locker')),
      capitalize(t('common:cancel')),
      'error'
    ).then((confirmed) => {
      if (confirmed) {
        removeLocker(locker.lockerId).then((res) => {
          if (res) {
            refresh();
          }
        });
      }
    });
  };

  const handleUpdateStatus = (status: LockerStatus) => {
    updateStatus([locker.lockerId], status).then((res) => {
      if (res) {
        refresh();
      }
    });
  };

  const unassign =
    !locker.assignedTo ?
      <></>
    : <PopupMenu.Item>
        <button onClick={() => onUnassign(locker)} data-test="locker-menu-unassign">
          <Icon icon={<Unlink2 />} />
          {t('lockers:unassign_locker_for', { pupil: t('pupils:name') })}
        </button>
      </PopupMenu.Item>;

  const assign =
    locker.assignedTo || locker?.status !== 'Ledigt' ?
      <></>
    : <PopupMenu.Item>
        <button onClick={() => onAssign(locker)} data-test="locker-menu-assign">
          <Icon icon={<Lock />} />
          {t('lockers:assign_locker_to_pupil')}
        </button>
      </PopupMenu.Item>;

  const remove =
    locker.assignedTo ?
      <></>
    : <PopupMenu.Item>
        <button onClick={() => handleDeleteLocker()} data-test="locker-menu-delete">
          <Icon icon={<Trash2 />} />
          {t('lockers:remove_locker_from_school', { resource: t('lockers:name') })}
        </button>
      </PopupMenu.Item>;

  const shouldEmpty =
    locker.assignedTo || locker?.status?.toLowerCase() === 'ska tömmas' ?
      <></>
    : <PopupMenu.Item>
        <button data-test="locker-menu-should-empty" onClick={() => handleUpdateStatus('Ska Tömmas')}>
          <Icon icon={<IterationCw />} />
          {t('lockers:status_to_should_empty')}
        </button>
      </PopupMenu.Item>;

  const isFree =
    locker.assignedTo || locker?.status?.toLowerCase() !== 'ska tömmas' ?
      <></>
    : <PopupMenu.Item>
        <button data-test="locker-menu-is-free" onClick={() => handleUpdateStatus('Ledigt')}>
          <Icon icon={<CheckCircle />} />
          {t('lockers:status_to_is_free')}
        </button>
      </PopupMenu.Item>;

  return (
    <ContextMenu>
      <PopupMenu.Item>
        <button data-test="locker-menu-edit" onClick={() => onEdit(locker)}>
          <Icon icon={<Settings />} />
          {t('lockers:change_settings')}
        </button>
      </PopupMenu.Item>
      {assign}
      {unassign}
      {shouldEmpty}
      {isFree}
      {remove}
    </ContextMenu>
  );
};
