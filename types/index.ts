export interface KirimItem {
  id: string;
  productName: string;
  quantity: number;
  unit: string;
  price: number;
  total: number;
  date: string;
}

export interface SaleItem {
  id: string;
  productName: string;
  quantity: number;
  costPrice: number;
  salePrice: number;
  saleTotal: number;
  profit: number;
  date: string;
}

export interface ExpenseItem {
  id: string;
  name: string;
  amount: number;
  date: string;
}

export interface WarehouseItem {
  productName: string;
  quantity: number;
  unit: string;
  lastCostPrice: number;
}

export interface MonthData {
  kirimlar: KirimItem[];
  sotuvlar: SaleItem[];
  xarajatlar: ExpenseItem[];
}

export interface YearData {
  [month: string]: MonthData;
}

export interface AllData {
  [year: string]: YearData;
}

export interface AppSettings {
  adminPassword: string;
}
