import React, { createContext, useContext, useState } from 'react';
import { StatusService } from '../services/StatusService';
import { StatusContextType, StatusProviderProps, CreateStatusRequest } from '../types';

const StatusContext = createContext<StatusContextType | undefined>(undefined);

export const useStatus = () => {
  const context = useContext(StatusContext);
  if (context === undefined) {
    throw new Error('useStatus must be used within a StatusProvider');
  }
  return context;
};

export const StatusProvider: React.FC<StatusProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createStatus = async (statusData: CreateStatusRequest): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const documentId = await StatusService.createStatus(statusData);
      console.log('Status created successfully with ID:', documentId);
      return documentId;
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create status';
      setError(errorMessage);
      console.error('Error in createStatus:', errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const contextValue: StatusContextType = {
    isLoading,
    error,
    createStatus,
    clearError,
  };

  return (
    <StatusContext.Provider value={contextValue}>
      {children}
    </StatusContext.Provider>
  );
};