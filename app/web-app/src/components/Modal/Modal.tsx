import { Modal } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { FC, ReactNode } from "react";

interface Props {
  status: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: string;
  padding?: string | number;
  overflow?: string;
}

export const AppModal: FC<Props> = ({ status, onClose, children, padding = "1rem", size }) => {
  const isDesktop = useMediaQuery("(min-width: 992px)");

  return (
    <Modal opened={status} onClose={onClose} withCloseButton={false} centered size={isDesktop ? size : "xs"} padding={padding}>
      {children}
    </Modal>
  );
};
