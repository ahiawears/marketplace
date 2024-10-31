import { cn } from "@/lib/utils";
import React from "react";

type Props = {
  className?: string;
};

export const Logo = (props: Props) => {
  return <h3 className={cn("text-3xl font-bold", props.className)}>ahịa</h3>;
};
