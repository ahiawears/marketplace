import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

const DashboardLayout = (props: Props) => {
  return <div>{props.children}</div>;
};

export default DashboardLayout;
