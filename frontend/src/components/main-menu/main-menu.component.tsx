import { MenuBar } from '@sk-web-gui/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { capitalize } from 'underscore.string';

export const MainMenu: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const currentResource = router.pathname.split('/')[1];

  const items = ['pupils', 'lockers'];

  useEffect(() => {
    console.log(router.pathname.split('/'));
  }, [router]);

  return (
    <MenuBar current={items.findIndex((item) => item === currentResource)} color="vattjom">
      {items.map((item, index) => (
        <MenuBar.Item key={`${index}-${item}`} wrapper={<Link href={`/${item}`} legacyBehavior passHref />}>
          <a>{capitalize(t(`${item}:name_other`))}</a>
        </MenuBar.Item>
      ))}
    </MenuBar>
  );
};
