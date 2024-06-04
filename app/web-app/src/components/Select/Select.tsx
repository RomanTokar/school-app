import { Select, SelectProps } from "@mantine/core";
import { FC } from "react";

interface Props extends SelectProps {
  data: {
    value: string;
    label: string;
  }[];
}

export const AppSelect: FC<Props> = ({ data, ...props }) => {
  return (
    <Select
      {...props}
      withinPortal
      data={data}
      styles={() => ({
        dropdown: {
          "div:first-of-type": {},
        },
        item: {
          "&[data-hovered]": {
            color: "#1f2025",
          },
        },
      })}
    />
  );
};
