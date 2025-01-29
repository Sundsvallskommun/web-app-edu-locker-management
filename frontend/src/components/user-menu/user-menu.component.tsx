import { useUserStore } from '@services/user-service/user-service';
import { Avatar, ColorSchemeMode, Icon, PopupMenu } from '@sk-web-gui/react';
import { useLocalStorage } from '@utils/use-localstorage.hook';
import { Check, ChevronLeft, Monitor, Moon, Sun } from 'lucide-react';
import NextLink from 'next/link';
import { useTranslation } from 'react-i18next';
import { capitalize } from 'underscore.string';
import { useShallow } from 'zustand/react/shallow';

export const UserMenu: React.FC = () => {
  const user = useUserStore(useShallow((state) => state.user));
  const [colorScheme, setColorScheme] = useLocalStorage(
    useShallow((state) => [state.colorScheme, state.setColorScheme])
  );

  const { t } = useTranslation();

  const colorSchemeIcons: Record<ColorSchemeMode, JSX.Element> = {
    light: <Sun />,
    dark: <Moon />,
    system: <Monitor />,
  };
  return (
    <div className="relative">
      <PopupMenu position="under" align="end">
        <PopupMenu.Button iconButton rounded className="overflow-hidden border-0 bg-transparent">
          <Avatar
            initials={user.name
              .split(' ')
              .map((name) => name.charAt(0))
              .join('')
              .toUpperCase()}
          ></Avatar>
        </PopupMenu.Button>
        <PopupMenu.Panel>
          <PopupMenu.Items>
            <PopupMenu.Group>
              <PopupMenu.Item>
                <PopupMenu position="left">
                  <PopupMenu.Button leftIcon={<Icon icon={<ChevronLeft />} />} className="!justify-between">
                    <span className="flex gap-12">
                      {colorSchemeIcons[colorScheme]}
                      {capitalize(t('layout:color_scheme'))}
                    </span>
                  </PopupMenu.Button>
                  <PopupMenu.Panel>
                    <PopupMenu.Items>
                      {(Object.keys(colorSchemeIcons) as ColorSchemeMode[]).map((scheme: ColorSchemeMode) => (
                        <PopupMenu.Item key={`cs-${scheme}`}>
                          <button
                            onClick={() => setColorScheme(scheme)}
                            role="menuitemradio"
                            aria-checked={scheme === colorScheme}
                            className="!justify-between min-w-[20rem]"
                          >
                            <span className="flex gap-12">
                              {colorSchemeIcons[scheme]}
                              {capitalize(t(`layout:color_schemes.${scheme}`))}
                            </span>
                            {scheme === colorScheme && <Icon.Padded size={18} rounded icon={<Check />} />}
                          </button>
                        </PopupMenu.Item>
                      ))}
                    </PopupMenu.Items>
                  </PopupMenu.Panel>
                </PopupMenu>
              </PopupMenu.Item>
            </PopupMenu.Group>
            <PopupMenu.Item>
              <NextLink href="/logout">{capitalize(t('common:logout'))}</NextLink>
            </PopupMenu.Item>
          </PopupMenu.Items>
        </PopupMenu.Panel>
      </PopupMenu>
    </div>
  );
};
