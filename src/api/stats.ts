import api from "./axios";

export type DashboardStats = {
  users: {
    total: number;
    active: number;
    inactive: number;
  };
  library: {
    totalTitles: number;
    totalCopies: number;
    availableCopies: number;
    categories: number;
  };
  distribution: {
    name: string;
    value: number;
  }[];
};

export async function getDashboardStats() {
  const { data } = await api.get<DashboardStats>("/stats/dashboard");
  return data;
}
