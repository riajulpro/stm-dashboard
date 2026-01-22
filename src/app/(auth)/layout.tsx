interface Props {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: Props) {
  return (
    <div className="h-screen w-full flex items-center justify-center p-3">
      {children}
    </div>
  );
}
