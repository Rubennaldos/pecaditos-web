/**
 * Hook useLocalStorage - Persiste estado en localStorage
 * 
 * Sincroniza automáticamente con localStorage y funciona
 * como useState pero con persistencia.
 * 
 * @example
 * const [theme, setTheme] = useLocalStorage('theme', 'light');
 * const [user, setUser] = useLocalStorage('user', null);
 */

import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // Función para obtener el valor inicial
  const readValue = useCallback((): T => {
    // Prevenir errores en SSR
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  // Estado que sincroniza con localStorage
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Función para actualizar el valor
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        // Permitir función como en useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        
        // Guardar en estado
        setStoredValue(valueToStore);
        
        // Guardar en localStorage
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
          
          // Disparar evento para sincronizar entre tabs
          window.dispatchEvent(new StorageEvent('storage', {
            key,
            newValue: JSON.stringify(valueToStore),
          }));
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // Función para eliminar el valor
  const removeValue = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
        setStoredValue(initialValue);
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Escuchar cambios desde otras tabs
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue !== null) {
        try {
          setStoredValue(JSON.parse(event.newValue));
        } catch {
          setStoredValue(event.newValue as unknown as T);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue, removeValue];
}

export default useLocalStorage;




