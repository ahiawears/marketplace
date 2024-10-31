import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

function AuthLayout({ children }: Props) {
  return <div>{children}</div>;
}

export default AuthLayout;
