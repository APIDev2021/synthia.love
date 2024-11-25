import React, { ReactNode } from "react";

interface ColorProps {
  children: ReactNode;
  color: string;
}

export const Color: React.FC<ColorProps> = ({ children, color }) => {
  const renderChildren = () => {
    return React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        const styledChild = React.cloneElement(child, {
          // @ts-ignore
          style: { ...child.props.style, color },
        });
        return styledChild;
      }
      return child;
    });
  };

  return <>{renderChildren()}</>;
};
