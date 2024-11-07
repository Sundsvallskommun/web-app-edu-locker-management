import { cx } from '@sk-web-gui/react';

interface TopBarProps {
  children?: React.ReactNode;
  className?: string;
}

export const TopBar: React.FC<TopBarProps> = ({ children, className }) => {
  return (
    <div
      className={cx(
        'flex flex-wrap justify-between items-center first-of-type:items-end pb-24 gap-24 mb-24 border-b-1 border-b-divider last-of-type:border-b-0 last-of-type:mb-0',
        className
      )}
    >
      {children}
    </div>
  );
};
