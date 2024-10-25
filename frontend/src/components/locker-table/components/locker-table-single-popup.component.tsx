import { LockerStatusUpdateStatusEnum, SchoolLocker } from '@data-contracts/backend/data-contracts';
import { Icon, PopupMenu, useConfirm, useSnackbar } from '@sk-web-gui/react';
import { CheckCircle, IterationCw, Lock, Settings, Trash2, Unlink2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { capitalize } from 'underscore.string';
import { useLockers } from '@services/locker-service';
import { ContextMenu } from '@components/context-menu/context-menu.component';

interface LockerTableSinglePopupProps {
  locker: SchoolLocker;
}

export const LockerTableSinglePopup: React.FC<LockerTableSinglePopupProps> = ({ locker }) => {
  const { t } = useTranslation();
  const { showConfirmation } = useConfirm();
  const { refresh, removeLocker, updateStatus } = useLockers(locker.unitId);

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

  const handleUpdateStatus = (status: LockerStatusUpdateStatusEnum) => {
    updateStatus([locker.lockerId], status).then((res) => {
      if (res) {
        refresh();
      }
    });
  };

  const terminate =
    !locker.assignedTo ?
      <></>
    : <PopupMenu.Item>
        <button>
          <Icon icon={<Unlink2 />} />
          {t('lockers:terminate_contract')}
        </button>
      </PopupMenu.Item>;

  const assign =
    locker.assignedTo || locker?.status ?
      <></>
    : <PopupMenu.Item>
        <button>
          <Icon icon={<Lock />} />
          {t('lockers:assign_locker')}
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
        <button
          data-test="locker-menu-should-empty"
          onClick={() => handleUpdateStatus(LockerStatusUpdateStatusEnum.EMPTY)}
        >
          <Icon icon={<IterationCw />} />
          {t('lockers:status_to_should_empty')}
        </button>
      </PopupMenu.Item>;

  const isFree =
    locker.assignedTo || locker?.status?.toLowerCase() !== 'ska tömmas' ?
      <></>
    : <PopupMenu.Item>
        <button data-test="locker-menu-is-free" onClick={() => handleUpdateStatus(LockerStatusUpdateStatusEnum.FREE)}>
          <Icon icon={<CheckCircle />} />
          {t('lockers:status_to_is_free')}
        </button>
      </PopupMenu.Item>;

  return (
    <ContextMenu>
      <PopupMenu.Item>
        <button>
          <Icon icon={<Settings />} />
          {t('lockers:change_settings')}
        </button>
      </PopupMenu.Item>
      {assign}
      {terminate}
      {shouldEmpty}
      {isFree}
      {remove}
    </ContextMenu>
  );
};