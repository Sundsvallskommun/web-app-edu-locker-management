'use client';

import LoaderFullScreen from '@components/loader/loader-fullscreen';
import { useUserStore } from '@services/user-service/user-service';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

export const LoginGuard: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [user, getMe] = useUserStore(useShallow((s) => [s.user, s.getMe]));

  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    getMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!mounted || (!user.name && !pathname.includes('/login'))) {
    return <LoaderFullScreen />;
  }

  return <>{children}</>;
};

export default LoginGuard;
