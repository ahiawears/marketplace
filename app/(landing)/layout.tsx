import { Header } from "@/components/header";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

const LandingLayout = (props: Props) => {
  return (
    <>
      <Header />
      <main className="md:py-32 py-44">{props.children}</main>
    </>
  );
};

export default LandingLayout;
