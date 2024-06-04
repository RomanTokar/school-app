export interface Classes {
  name: string;
  location: string;
  city: string;
  matnas: string;
  groupLink: string;
  startDate: string;
  endDate: string;
  recurringEndDate: string;
  _id: string;
  teacher: СlassTeacher;
  studentsCount: number;
  recurringType: string;
  parentId: string;
  isRecurring: boolean;
}

export interface СlassTeacher {
  _id: string;
  fullName: string;
}

export interface AddClass {
  name: string;
  location: string;
  groupLink: string;
  startDate: string;
  endDate: string;
  teacherId: string;
  matnas: string;
  city: string;
  isRecurring?: boolean;
  recurringEndDate?: string;
}

export interface Matnas {
  name: string;
  _id: string;
}

export interface City {
  name: string;
  _id: string;
}

export interface UpdateClass {
  _id: string;
  name?: string;
  location?: string;
  groupLink?: string;
  startDate?: string;
  endDate?: string;
  teacherId?: string;
  matnas?: string;
  city?: string;
  updateType?: string;
  recurringEndDate?: string;
}
