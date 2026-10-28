'use client';

import { NavigationBar } from '@sk-web-gui/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { capitalize } from 'underscore.string';

export const MainMenu: React.FC = () => {
  const { t } = useTranslation();
  const pathname = usePathname();

  const currentResource = pathname.split('/')[1];

  const items = ['pupils', 'lockers'];

  return (
    <NavigationBar current={items.findIndex((item) => item === currentResource)} color="vattjom">
      {items.map((item, index) => (
        <NavigationBar.Item key={`${index}-${item}`}>
          <Link href={`/${item}`} data-test={`main-menu-${item}`}>
            {capitalize(t(`${item}:name_other`))}
          </Link>
        </NavigationBar.Item>
      ))}
    </NavigationBar>
  );
};
