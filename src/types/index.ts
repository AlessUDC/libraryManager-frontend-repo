export type Province = {
  provinceId: string;
  title: string;
};

export type District = {
  districtId: string;
  provinceId: string;
  title: string;
};

export type Faculty = {
  facultyId: string;
  title: string;
};

export type School = {
  schoolId: string;
  facultyId: string;
  title: string;
};
export type Role = "student" | "teacher";