import { Icon, PopupMenu } from '@sk-web-gui/react';
import { Ellipsis } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useDebounceCallback, useEventListener, useWindowSize } from 'usehooks-ts';

interface ContextMenuProps {
  children: React.ReactNode;
  disabled?: boolean;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ children, disabled }) => {
  const [_top, setTop] = useState(0);
  const [_left, setLeft] = useState(0);
  const [_right, setRight] = useState(0);
  const [_bottom, setBottom] = useState(0);

  const { width = 0, height = 0 } = useWindowSize();
  const menuWidth = 250;
  const menuMargin = 20;

  const leftPosition = _left - menuWidth - menuMargin;
  const rightPosition = _right + menuMargin;
  const left = rightPosition + menuWidth + menuMargin > width ? leftPosition : rightPosition;

  const top = _top + 150 > height ? 'unset' : _top;
  const bottom = top === 'unset' ? height - _bottom : 'unset';

  const buttonRef = useRef<HTMLButtonElement>(null);

  const updateValues = () => {
    if (buttonRef.current) {
      const values = buttonRef.current.getBoundingClientRect();
      setTop(values.top);
      setBottom(values.bottom);
      setLeft(values.left);
      setRight(values.right);
    }
  };

  const delayedUpdate = useDebounceCallback(() => {
    updateValues();
  }, 10);

  useEffect(() => {
    delayedUpdate();
  }, [width, height]);

  useEventListener('scroll', () => updateValues());

  return (
    <PopupMenu position="left" align={'start'} size="sm">
      <PopupMenu.Button size="sm" variant="tertiary" iconButton onClick={() => updateValues()} disabled={disabled}>
        <Icon ref={buttonRef} icon={<Ellipsis />} />
      </PopupMenu.Button>
      <PopupMenu.Panel className="fixed w-[25rem]" style={{ top: top, bottom: bottom, left: left }}>
        <PopupMenu.Items>{children}</PopupMenu.Items>
      </PopupMenu.Panel>
    </PopupMenu>
  );
};
