import { ReactNode } from "react";

type Props = {
    children: ReactNode;
};

function BrandAuthLayout({ children }: Props) {
    return <div>{ children }</div>
}

export default BrandAuthLayout;