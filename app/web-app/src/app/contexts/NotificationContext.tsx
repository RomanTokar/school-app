import { FC, ReactNode, createContext, useContext, useState } from "react";
import { Notification, NotificationProps } from "../../components/Notification/notification";

interface NotificationContextType {
  notifications: NotificationProps[];
  addNotification: (text: string) => void;
  removeNotification: () => void;
}

interface NotificationProviderProps {
  children: ReactNode;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);

  const addNotification = (text: string) => {
    const newNotification = { text };
    setNotifications((prevNotifications) => [...prevNotifications, newNotification]);
  };

  const removeNotification = () => {
    setNotifications((prevNotifications) => prevNotifications.slice(1));
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
      {notifications.map((notification, index) => (
        <Notification key={index} text={notification.text} onClose={removeNotification} />
      ))}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};
