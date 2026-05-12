export type Role = 'STUDENT' | 'TEACHER' | 'LIBRARIAN' | 'ADMINISTRATOR';

export interface UserData {
  userDataId: string;
  name: string;
  paternalSurname: string;
  maternalSurname: string;
  documentNumber: string;
  email: string;
  birthdate: string;
  mobilePhone?: string;
  landlinePhone?: string;
  gender?: string;
  maritalStatus?: string;
  activeState: boolean;
  districtId?: string;
  addressId?: string;
  district?: {
    districtId: string;
    provinceId: string;
    title: string;
  };
  address?: {
    addressId: string;
    title: string;
  };
}

export interface User {
  userId: string;
  code: string;
  slug: string;
  role: Role;
  isConfirmed: boolean;
  userData: UserData;
  student?: {
    schoolId: string;
    cycle: number;
    school: {
      schoolId: string;
      facultyId: string;
      title: string;
    };
  };
  teacher?: {
    facultyId: string;
    faculty: {
      facultyId: string;
      title: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}
