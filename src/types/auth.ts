export type RegisterFormData = {
  name: string;
  paternalSurname: string;
  maternalSurname: string;
  documentType: "DNI" | "CE";
  documentNumber: string;
  birthdate: string;
  gender: string;
  maritalStatus: string;
  provinceId: string;
  districtId: string;
  address: string;
  mobilePhone: string;
  landlinePhone: string;
  email: string;
  password: string;
  code: string;
  cycle?: number;
  facultyId: string;
  schoolId?: string;
};

