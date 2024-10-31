import { Header } from "@/components/header";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

const LandingLayout = (props: Props) => {
  return (
    <>
      <Header />
      <main>{props.children}</main>
    </>
  );
};

export default LandingLayout;
