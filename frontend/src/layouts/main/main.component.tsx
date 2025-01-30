interface MainProps {
  children: React.ReactNode;
}

export const Main: React.FC<MainProps> = ({ children }) => {
  return (
    <div className="container">
      <main id="content">{children}</main>
    </div>
  );
};

export default Main;
