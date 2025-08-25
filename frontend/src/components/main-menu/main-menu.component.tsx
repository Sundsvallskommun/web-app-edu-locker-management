import { MenuBar } from '@sk-web-gui/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { capitalize } from 'underscore.string';

export const MainMenu: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const currentResource = router.pathname.split('/')[1];

  const items = ['pupils', 'lockers'];

  return (
    <MenuBar current={items.findIndex((item) => item === currentResource)} color="vattjom">
      {items.map((item, index) => (
        <MenuBar.Item key={`${index}-${item}`}>
          <Link href={`/${item}`} data-test={`main-menu-${item}`}>
            {capitalize(t(`${item}:name_other`))}
          </Link>
        </MenuBar.Item>
      ))}
    </MenuBar>
  );
};
