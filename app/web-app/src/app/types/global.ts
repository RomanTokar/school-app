export interface Remind {
  text: string;
  date: string;
  _id: string;
}

export type AddRemind = Omit<Remind, "_id">;

export interface Notification {
  createdAt: string;
  updatedAt: string;
  type: string;
  data: {
    text: string;
  };
  isRead: boolean;
  userId: string;
  _id: string;
}
