import { Header } from "@/components/header";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

const LandingLayout = (props: Props) => {
  return (
    <> 
      <Header />
      <main className="md:pt-32 pt-44">{props.children}</main>  
    </>
  );
};

export default LandingLayout;
