import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FarmData {
  location?: { country: string; state: string; localGovernment: string };
  soilType?: string;
  cropType?: string;
  farmSize?: string;
  waterSource?: string;
  irrigationMethod?: string;
  expectedYield?: string;
  harvestDate?: string;
}

interface FarmDataContextType {
  farmData: FarmData;
  updateFarmData: (data: Partial<FarmData>) => void;
  clearFarmData: () => void;
}

const FarmDataContext = createContext<FarmDataContextType | undefined>(undefined);

export const FarmDataProvider = ({ children }: { children: ReactNode }) => {
  const [farmData, setFarmData] = useState<FarmData>({});

  const updateFarmData = (data: Partial<FarmData>) => {
    setFarmData(prev => ({ ...prev, ...data }));
  };

  const clearFarmData = () => {
    setFarmData({});
  };

  return (
    <FarmDataContext.Provider value={{ farmData, updateFarmData, clearFarmData }}>
      {children}
    </FarmDataContext.Provider>
  );
};

export const useFarmData = () => {
  const context = useContext(FarmDataContext);
  if (!context) {
    throw new Error('useFarmData must be used within FarmDataProvider');
  }
  return context;
};
