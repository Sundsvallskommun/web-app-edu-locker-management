import { ContextMenu } from '@components/context-menu/context-menu.component';
import { Pupil } from '@data-contracts/backend/data-contracts';
import { PopupMenu } from '@sk-web-gui/react';
import { useTranslation } from 'react-i18next';

interface PupilTableMultiplePopupProps {
  pupils: Pupil[];
}

export const PupilTableMultiplePopup: React.FC<PupilTableMultiplePopupProps> = ({ pupils }) => {
  const { t } = useTranslation();

  return (
    <ContextMenu disabled={!pupils || pupils.length < 1}>
      <PopupMenu.Item>
        <button>{pupils.length}</button>
      </PopupMenu.Item>
    </ContextMenu>
  );
};
