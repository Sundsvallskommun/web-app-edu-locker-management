import DefaultLayout from '@layouts/default-layout/default-layout.component';
import Main from '@layouts/main/main.component';
import { ReactNode } from 'react';

export default function PupilsLayout({ children }: { children: ReactNode }) {
  return (
    <DefaultLayout>
      <Main>{children}</Main>
    </DefaultLayout>
  );
}
