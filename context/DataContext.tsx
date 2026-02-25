import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import {
  KirimItem,
  SaleItem,
  ExpenseItem,
  AllData,
  MonthData,
  WarehouseItem,
  AppSettings,
} from '@/types';
import { getCurrentYear, getCurrentMonth, generateId, getCurrentDateString } from '@/utils/helpers';

const STORAGE_KEYS = {
  DATA: 'biznes_data',
  WAREHOUSE: 'biznes_warehouse',
  SETTINGS: 'biznes_settings',
};

const DEFAULT_SETTINGS: AppSettings = {
  adminPassword: '1234',
};

function emptyMonth(): MonthData {
  return { kirimlar: [], sotuvlar: [], xarajatlar: [] };
}

export const [DataProvider, useData] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [allData, setAllData] = useState<AllData>({});
  const [warehouse, setWarehouse] = useState<WarehouseItem[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  const dataQuery = useQuery({
    queryKey: ['biznes_data'],
    queryFn: async () => {
      const [dataStr, whStr, setStr] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.DATA),
        AsyncStorage.getItem(STORAGE_KEYS.WAREHOUSE),
        AsyncStorage.getItem(STORAGE_KEYS.SETTINGS),
      ]);
      return {
        data: dataStr ? (JSON.parse(dataStr) as AllData) : {},
        warehouse: whStr ? (JSON.parse(whStr) as WarehouseItem[]) : [],
        settings: setStr ? (JSON.parse(setStr) as AppSettings) : DEFAULT_SETTINGS,
      };
    },
  });

  useEffect(() => {
    if (dataQuery.data) {
      setAllData(dataQuery.data.data);
      setWarehouse(dataQuery.data.warehouse);
      setSettings(dataQuery.data.settings);
    }
  }, [dataQuery.data]);

  const saveMutation = useMutation({
    mutationFn: async (params: { data?: AllData; wh?: WarehouseItem[]; sett?: AppSettings }) => {
      const promises: Promise<void>[] = [];
      if (params.data) promises.push(AsyncStorage.setItem(STORAGE_KEYS.DATA, JSON.stringify(params.data)));
      if (params.wh) promises.push(AsyncStorage.setItem(STORAGE_KEYS.WAREHOUSE, JSON.stringify(params.wh)));
      if (params.sett) promises.push(AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(params.sett)));
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['biznes_data'] });
    },
  });

  const ensureMonth = useCallback((data: AllData, year: string, month: string): AllData => {
    const updated = { ...data };
    if (!updated[year]) updated[year] = {};
    if (!updated[year][month]) updated[year][month] = emptyMonth();
    return updated;
  }, []);

  const addKirim = useCallback((productName: string, quantity: number, unit: string, price: number) => {
    const year = getCurrentYear();
    const month = getCurrentMonth();
    const item: KirimItem = {
      id: generateId(),
      productName,
      quantity,
      unit,
      price,
      total: quantity * price,
      date: getCurrentDateString(),
    };

    const updated = ensureMonth({ ...allData }, year, month);
    updated[year][month] = {
      ...updated[year][month],
      kirimlar: [...(updated[year][month].kirimlar || []), item],
    };

    const whCopy = [...warehouse];
    const existing = whCopy.find(w => w.productName.toLowerCase() === productName.toLowerCase());
    if (existing) {
      existing.quantity += quantity;
      existing.lastCostPrice = price;
      existing.unit = unit;
    } else {
      whCopy.push({ productName, quantity, unit, lastCostPrice: price });
    }

    setAllData(updated);
    setWarehouse(whCopy);
    saveMutation.mutate({ data: updated, wh: whCopy });
    console.log('[DataContext] Kirim added:', item.productName, item.total);
  }, [allData, warehouse, ensureMonth, saveMutation]);

  const addExpense = useCallback((name: string, amount: number) => {
    const year = getCurrentYear();
    const month = getCurrentMonth();
    const item: ExpenseItem = {
      id: generateId(),
      name,
      amount,
      date: getCurrentDateString(),
    };

    const updated = ensureMonth({ ...allData }, year, month);
    updated[year][month] = {
      ...updated[year][month],
      xarajatlar: [...(updated[year][month].xarajatlar || []), item],
    };

    setAllData(updated);
    saveMutation.mutate({ data: updated });
    console.log('[DataContext] Expense added:', item.name, item.amount);
  }, [allData, ensureMonth, saveMutation]);

  const addSale = useCallback((productName: string, quantity: number, salePrice: number) => {
    const year = getCurrentYear();
    const month = getCurrentMonth();

    const whCopy = [...warehouse];
    const whItem = whCopy.find(w => w.productName.toLowerCase() === productName.toLowerCase());
    const costPrice = whItem?.lastCostPrice ?? 0;

    const item: SaleItem = {
      id: generateId(),
      productName,
      quantity,
      costPrice,
      salePrice,
      saleTotal: quantity * salePrice,
      profit: (salePrice - costPrice) * quantity,
      date: getCurrentDateString(),
    };

    const updated = ensureMonth({ ...allData }, year, month);
    updated[year][month] = {
      ...updated[year][month],
      sotuvlar: [...(updated[year][month].sotuvlar || []), item],
    };

    if (whItem) {
      whItem.quantity = Math.max(0, whItem.quantity - quantity);
    }

    setAllData(updated);
    setWarehouse(whCopy);
    saveMutation.mutate({ data: updated, wh: whCopy });
    console.log('[DataContext] Sale added:', item.productName, item.saleTotal, 'profit:', item.profit);
  }, [allData, warehouse, ensureMonth, saveMutation]);

  const deleteKirim = useCallback((year: string, month: string, id: string) => {
    const updated = { ...allData };
    if (updated[year]?.[month]) {
      const item = updated[year][month].kirimlar.find(k => k.id === id);
      updated[year][month] = {
        ...updated[year][month],
        kirimlar: updated[year][month].kirimlar.filter(k => k.id !== id),
      };
      if (item) {
        const whCopy = [...warehouse];
        const whItem = whCopy.find(w => w.productName.toLowerCase() === item.productName.toLowerCase());
        if (whItem) {
          whItem.quantity = Math.max(0, whItem.quantity - item.quantity);
        }
        setWarehouse(whCopy);
        saveMutation.mutate({ data: updated, wh: whCopy });
      } else {
        saveMutation.mutate({ data: updated });
      }
      setAllData(updated);
    }
  }, [allData, warehouse, saveMutation]);

  const deleteSale = useCallback((year: string, month: string, id: string) => {
    const updated = { ...allData };
    if (updated[year]?.[month]) {
      const item = updated[year][month].sotuvlar.find(s => s.id === id);
      updated[year][month] = {
        ...updated[year][month],
        sotuvlar: updated[year][month].sotuvlar.filter(s => s.id !== id),
      };
      if (item) {
        const whCopy = [...warehouse];
        const whItem = whCopy.find(w => w.productName.toLowerCase() === item.productName.toLowerCase());
        if (whItem) {
          whItem.quantity += item.quantity;
        }
        setWarehouse(whCopy);
        saveMutation.mutate({ data: updated, wh: whCopy });
      } else {
        saveMutation.mutate({ data: updated });
      }
      setAllData(updated);
    }
  }, [allData, warehouse, saveMutation]);

  const deleteExpense = useCallback((year: string, month: string, id: string) => {
    const updated = { ...allData };
    if (updated[year]?.[month]) {
      updated[year][month] = {
        ...updated[year][month],
        xarajatlar: updated[year][month].xarajatlar.filter(x => x.id !== id),
      };
      setAllData(updated);
      saveMutation.mutate({ data: updated });
    }
  }, [allData, saveMutation]);

  const changePassword = useCallback((newPassword: string) => {
    const updated = { ...settings, adminPassword: newPassword };
    setSettings(updated);
    saveMutation.mutate({ sett: updated });
    console.log('[DataContext] Password changed');
  }, [settings, saveMutation]);

  const verifyPassword = useCallback((password: string): boolean => {
    return password === settings.adminPassword;
  }, [settings]);

  const getYears = useCallback((): string[] => {
    const years = Object.keys(allData).sort((a, b) => Number(b) - Number(a));
    const currentYear = getCurrentYear();
    if (!years.includes(currentYear)) {
      years.unshift(currentYear);
    }
    return years;
  }, [allData]);

  const getMonths = useCallback((year: string): string[] => {
    return Object.keys(allData[year] ?? {});
  }, [allData]);

  const getMonthData = useCallback((year: string, month: string): MonthData => {
    return allData[year]?.[month] ?? emptyMonth();
  }, [allData]);

  const getReport = useCallback((year: string, month: string) => {
    const data = getMonthData(year, month);
    const totalKirim = data.kirimlar.reduce((s, k) => s + k.total, 0);
    const totalSotuv = data.sotuvlar.reduce((s, s2) => s + s2.saleTotal, 0);
    const totalFoyda = data.sotuvlar.reduce((s, s2) => s + s2.profit, 0);
    const totalXarajat = data.xarajatlar.reduce((s, x) => s + x.amount, 0);
    const sofFoyda = totalFoyda - totalXarajat;
    return { totalKirim, totalSotuv, totalFoyda, totalXarajat, sofFoyda };
  }, [getMonthData]);

  return {
    allData,
    warehouse,
    settings,
    isLoading: dataQuery.isLoading,
    addKirim,
    addExpense,
    addSale,
    deleteKirim,
    deleteSale,
    deleteExpense,
    changePassword,
    verifyPassword,
    getYears,
    getMonths,
    getMonthData,
    getReport,
  };
});