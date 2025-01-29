import Head from 'next/head';

interface EmptyLayoutProps {
  title: string;
  children: React.ReactNode;
}

export const EmptyLayout: React.FC<EmptyLayoutProps> = ({ title, children }) => {
  return (
    <div className="EmptyLayout">
      <Head>
        <title>{title}</title>
      </Head>

      <div className="min-h-screen">{children}</div>
    </div>
  );
};

export default EmptyLayout;
