import { ContextMenu } from '@components/context-menu/context-menu.component';
import { LockerStatusUpdateStatusEnum, SchoolLocker } from '@data-contracts/backend/data-contracts';
import { useLockers } from '@services/locker-service';
import { Icon, PopupMenu, useConfirm } from '@sk-web-gui/react';
import { CheckCircle, IterationCw, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { capitalize } from 'underscore.string';

interface LockerTableMultiplePopupProps {
  selectedLockers: SchoolLocker[];
  schoolUnit: string;
}

export const LockerTableMultiplePopup: React.FC<LockerTableMultiplePopupProps> = ({ selectedLockers, schoolUnit }) => {
  const { t } = useTranslation();
  const { showConfirmation } = useConfirm();
  const { refresh, removeLocker, updateStatus } = useLockers(schoolUnit);

  const lockers_to_remove = [...selectedLockers].filter((locker) => locker && !locker?.assignedTo);
  const free_lockers = [...selectedLockers].filter((locker) => locker && !locker?.assignedTo && !locker?.status);
  const lockers_to_empty = [...selectedLockers].filter(
    (locker) => locker && !locker?.assignedTo && locker?.status?.toLowerCase() === 'ska tömmas'
  );

  const handleDeleteLockers = () => {
    showConfirmation(
      capitalize(
        t('lockers:remove_lockers_with_count', { lockers: t('lockers:count', { count: lockers_to_remove?.length }) })
      ),
      capitalize(t('common:cant_be_undone')),
      capitalize(t('lockers:remove_locker')),
      capitalize(t('common:cancel')),
      'error'
    ).then((confirmed) => {
      if (confirmed) {
        for (let index = 0; index < lockers_to_remove.length; index++) {
          removeLocker(lockers_to_remove[index].lockerId).then((res) => {
            if (res) {
              refresh();
            }
          });
        }
      }
    });
  };

  const handleUpdateStatus = (lockers: string[], status: LockerStatusUpdateStatusEnum) => {
    updateStatus(lockers, status).then((res) => {
      if (res) {
        refresh();
      }
    });
  };

  const remove =
    !lockers_to_remove || lockers_to_remove.length < 1 ?
      <></>
    : <PopupMenu.Item>
        <button onClick={() => handleDeleteLockers()} data-test="locker-menu-multi-delete">
          <Icon icon={<Trash2 />} />
          {t('lockers:remove_locker_from_school', {
            resource: t('lockers:count', { count: lockers_to_remove?.length }),
          })}
        </button>
      </PopupMenu.Item>;

  const shouldEmpty =
    !free_lockers || free_lockers.length < 1 ?
      <></>
    : <PopupMenu.Item>
        <button
          data-test="locker-menu-multi-should-empty"
          onClick={() =>
            handleUpdateStatus(
              free_lockers.map((locker) => locker.lockerId),
              LockerStatusUpdateStatusEnum.EMPTY
            )
          }
        >
          <Icon icon={<IterationCw />} />
          {t('lockers:status_to_should_empty')}
        </button>
      </PopupMenu.Item>;

  const isFree =
    !lockers_to_empty || lockers_to_empty.length < 1 ?
      <></>
    : <PopupMenu.Item>
        <button
          data-test="locker-menu-multi-is-free"
          onClick={() =>
            handleUpdateStatus(
              lockers_to_empty.map((locker) => locker.lockerId),
              LockerStatusUpdateStatusEnum.FREE
            )
          }
        >
          <Icon icon={<CheckCircle />} />
          {t('lockers:status_to_is_free')}
        </button>
      </PopupMenu.Item>;

  return (
    <ContextMenu disabled={!selectedLockers || selectedLockers?.length < 1}>
      {shouldEmpty}
      {isFree}
      {remove}
    </ContextMenu>
  );
};
