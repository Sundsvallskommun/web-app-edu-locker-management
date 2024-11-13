import { ContextMenu } from '@components/context-menu/context-menu.component';
import { Pupil } from '@data-contracts/backend/data-contracts';
import { PopupMenu } from '@sk-web-gui/react';
import { useTranslation } from 'react-i18next';

interface PupilTableSinglePopupProps {
  pupil: Pupil;
}

export const PupilTableSinglePopup: React.FC<PupilTableSinglePopupProps> = ({ pupil }) => {
  const { t } = useTranslation();

  return (
    <ContextMenu>
      <PopupMenu.Item>
        <button>{pupil.name}</button>
      </PopupMenu.Item>
    </ContextMenu>
  );
};
