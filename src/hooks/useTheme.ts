import { useState, useEffect } from 'react';

export function useTheme() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Detecta tema baseado no horário (6h-18h = light, 18h-6h = dark)
    const hour = new Date().getHours();
    const shouldBeDark = hour < 6 || hour >= 18;
    setIsDark(shouldBeDark);

    // Aplica a classe no documento
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return { isDark, toggleTheme };
}