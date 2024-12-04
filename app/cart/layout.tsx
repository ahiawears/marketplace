import { ServerHeader } from "@/components/headerServerComponent";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

const LandingLayout = (props: Props) => {
  return (
    <>
      <ServerHeader />
      <main className="md:pt-32 pt-44">{props.children}</main>
    </>
  );
};

export default LandingLayout;
