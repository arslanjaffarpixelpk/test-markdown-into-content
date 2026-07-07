import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

function currentTheme(): Theme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

/**
 * Theme state backed by the `.dark` class on <html> + localStorage. Subscribes
 * to class changes via MutationObserver so any component (including the Widget
 * iframe, which must re-inject colors) re-renders when the theme flips.
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() =>
    typeof document === 'undefined' ? 'light' : currentTheme(),
  );

  useEffect(() => {
    const el = document.documentElement;
    const observer = new MutationObserver(() => setTheme(currentTheme()));
    observer.observe(el, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const toggleTheme = useCallback(() => {
    const el = document.documentElement;
    const next: Theme = el.classList.contains('dark') ? 'light' : 'dark';
    el.classList.toggle('dark', next === 'dark');
    try {
      localStorage.setItem('theme', next);
    } catch {
      /* ignore */
    }
  }, []);

  return { theme, toggleTheme };
}
