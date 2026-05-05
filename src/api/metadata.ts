import api from './axios';
import type { Province, District, Faculty, School } from '../types';

export const getProvinces = async (): Promise<Province[]> => {
  const { data } = await api.get<Province[]>('/metadata/provinces');
  return data;
};

export const getDistricts = async (provinceId: string): Promise<District[]> => {
  const { data } = await api.get<District[]>(`/metadata/districts/${provinceId}`);
  return data;
};

export const getFaculties = async (): Promise<Faculty[]> => {
  const { data } = await api.get<Faculty[]>('/metadata/faculties');
  return data;
};

export const getSchools = async (facultyId: string): Promise<School[]> => {
  const { data } = await api.get<School[]>(`/metadata/schools/${facultyId}`);
  return data;
};
