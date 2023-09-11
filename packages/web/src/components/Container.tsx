import type { ReactNode } from "react";

import bg from "../assets/bg.png";

type ContainerProps = {
  children: ReactNode;
};

const Container = ({ children }: ContainerProps) => (
  <div
    style={{ backgroundImage: `url(${bg})` }}
    className="relative w-screen h-screen bg-1/5 bg-repeat scroll-auto flex flex-col"
  >
    <div className="absolute top-0 left-0 w-full h-32 screen-glow rotate-180 pointer-events-none" />
    <div className="absolute bottom-0 left-0 w-full h-32 screen-glow pointer-events-none" />
    <div className="absolute top-0 left-0 w-full h-full screen-darken pointer-events-none" />
    {children}
  </div>
);

export default Container;
