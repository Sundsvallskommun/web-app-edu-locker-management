interface EmptyLayoutProps {
  children: React.ReactNode;
}

export const EmptyLayout: React.FC<EmptyLayoutProps> = ({ children }) => {
  return (
    <div className="EmptyLayout">
      <div className="min-h-screen">{children}</div>
    </div>
  );
};

export default EmptyLayout;
