export interface Teacher {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  classesCount: number;
  avatar: string;
}

export interface AddTeacher {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
}

export interface TeacherStudents {
  fullName: string;
  city: string;
  school: string;
  matnas: string;
  ID: string;
  phoneNumber: string;
  email: string;
  WhatsAppLink: string;
  _id: string;
  classesCount: number;
  avatar: string;
}

export interface TeacherNote {
  text: string;
  _id: string;
  createdAt: string;
}

export interface TeacherFile {
  name: string;
  notes: string;
  _id: string;
  url: string;
}
