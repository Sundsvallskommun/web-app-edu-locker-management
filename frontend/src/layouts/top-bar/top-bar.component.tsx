import { cx } from '@sk-web-gui/react';

interface TopBarProps {
  children?: React.ReactNode;
  className?: string;
}

export const TopBar: React.FC<TopBarProps> = ({ children, className }) => {
  return (
    <div className={cx('flex justify-between items-center pb-24 mb-24 border-b-1 border-b-divider', className)}>
      {children}
    </div>
  );
};
