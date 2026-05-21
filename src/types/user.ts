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
    province?: {
      provinceId: string;
      title: string;
    };
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
  loanBlockUntil?: string | null;
  systemBlockUntil?: string | null;
  student?: {
    schoolId: string;
    cycle: number;
    onTimeDeliveriesCount?: number;
    missedReservationsCount?: number;
    school: {
      schoolId: string;
      facultyId: string;
      title: string;
      faculty?: {
        facultyId: string;
        title: string;
      };
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
