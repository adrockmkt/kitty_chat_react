import { useEffect } from 'react';

export function useTheme() {
  const isDark = true;

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const toggleTheme = () => {
    // Tema sempre escuro, botão desabilitado
  };

  return { isDark, toggleTheme };
}