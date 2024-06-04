export interface Student {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  classesCount: number;
  city: string;
  school: string;
  matnas: string;
  ID: string;
  WhatsAppLink: string;
  avatar: string;
}

export interface AddStudent {
  fullName: string;
  city: string;
  school: string;
  matnas: string;
  ID?: string;
  phoneNumber: string;
  email: string;
  WhatsAppLink: string;
}

export interface Note {
  text: string;
  _id: string;
  createdAt: string;
}

export interface Сlass {
  name: string;
  location: string;
  city: string;
  matnas: string;
  groupLink: string;
  startDate: string;
  endDate: string;
  recurringEndDate: string;
  _id: string;
  teacher: {
    _id: string;
    fullName: string;
  };
  studentsCount: number;
  recurringType: string;
  parentId: string;
  isRecurring: boolean;
}

export interface StudentFile {
  name: string;
  notes: string;
  _id: string;
  url: string;
}

export interface Attendance {
  present: number;
  absent: number;
}
