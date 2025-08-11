import { useState, useEffect } from 'react';

interface UseDropdownMemoryOptions {
  key: string;
  defaultValue?: string;
  excludeValues?: string[]; // Values to not remember (like empty strings)
  disableAutosave?: boolean; // Disable localStorage saving completely
}

export function useDropdownMemory({
  key,
  defaultValue = '',
  excludeValues = [''],
  disableAutosave = false
}: UseDropdownMemoryOptions) {
  const [value, setValue] = useState<string>(defaultValue);

  // Load remembered value on mount
  useEffect(() => {
    if (disableAutosave) return;

    try {
      const remembered = localStorage.getItem(`dropdown_${key}`);
      if (remembered && !excludeValues.includes(remembered)) {
        setValue(remembered);
      }
    } catch (error) {
      console.warn(`Failed to load dropdown memory for ${key}:`, error);
    }
  }, [key, excludeValues, disableAutosave]);

  // Function to update value and save to localStorage
  const updateValue = (newValue: string) => {
    setValue(newValue);

    if (disableAutosave) return;

    try {
      if (!excludeValues.includes(newValue)) {
        localStorage.setItem(`dropdown_${key}`, newValue);
      }
    } catch (error) {
      console.warn(`Failed to save dropdown memory for ${key}:`, error);
    }
  };

  // Function to clear remembered value
  const clearValue = () => {
    setValue(defaultValue);
    try {
      localStorage.removeItem(`dropdown_${key}`);
    } catch (error) {
      console.warn(`Failed to clear dropdown memory for ${key}:`, error);
    }
  };

  return {
    value,
    setValue: updateValue,
    clearValue
  };
}

// Helper function to create unique keys for different contexts
export function createDropdownKey(component: string, field: string, context?: string): string {
  return context ? `${component}_${context}_${field}` : `${component}_${field}`;
}

// Hook for managing multi-field dropdown memory (e.g., facility, department, area, standard)
interface UseMultiDropdownMemoryOptions {
  keys: string[];
  defaultValues?: Record<string, string>;
  excludeValues?: string[];
}

export function useMultiDropdownMemory({
  keys,
  defaultValues = {},
  excludeValues = ['']
}: UseMultiDropdownMemoryOptions) {
  const [values, setValues] = useState<Record<string, string>>({});

  // Load remembered values on mount
  useEffect(() => {
    const loadedValues: Record<string, string> = {};
    keys.forEach(key => {
      try {
        const remembered = localStorage.getItem(`dropdown_${key}`);
        if (remembered && !excludeValues.includes(remembered)) {
          loadedValues[key] = remembered;
        } else {
          loadedValues[key] = defaultValues[key] || '';
        }
      } catch (error) {
        console.warn(`Failed to load dropdown memory for ${key}:`, error);
        loadedValues[key] = defaultValues[key] || '';
      }
    });
    setValues(loadedValues);
  }, [keys.join(','), excludeValues.join(',')]);

  // Function to update a specific field value and save to localStorage
  const updateValue = (key: string, newValue: string) => {
    setValues(prev => ({
      ...prev,
      [key]: newValue
    }));

    try {
      if (!excludeValues.includes(newValue)) {
        localStorage.setItem(`dropdown_${key}`, newValue);
      }
    } catch (error) {
      console.warn(`Failed to save dropdown memory for ${key}:`, error);
    }
  };

  // Function to clear all remembered values
  const clearValues = () => {
    const clearedValues: Record<string, string> = {};
    keys.forEach(key => {
      clearedValues[key] = defaultValues[key] || '';
      try {
        localStorage.removeItem(`dropdown_${key}`);
      } catch (error) {
        console.warn(`Failed to clear dropdown memory for ${key}:`, error);
      }
    });
    setValues(clearedValues);
  };

  return {
    values,
    updateValue,
    clearValues,
    getValue: (key: string) => values[key] || defaultValues[key] || ''
  };
}
