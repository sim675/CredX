'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import InfiniteGrid from '@/components/ui/infinite-grid';

export default function DemoPage() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check system preference for dark mode
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(prefersDark);
    
    // Listen for changes in system preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    // Sync dark mode state with HTML class
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <div className="w-full relative min-h-screen">
      {/* Sticky Theme Toggle */}
      <button
        onClick={() => setIsDark(!isDark)}
        className="fixed top-4 right-4 z-50 p-3 rounded-full bg-background/50 backdrop-blur-sm border border-border shadow-lg hover:scale-110 active:scale-95 transition-all flex items-center justify-center group"
        aria-label="Toggle Theme"
      >
        {isDark ? (
          <Sun className="w-5 h-5 text-yellow-500 group-hover:rotate-45 transition-transform" />
        ) : (
          <Moon className="w-5 h-5 text-indigo-500 group-hover:-rotate-12 transition-transform" />
        )}
      </button>

      {/* Main Content */}
      <main>
        <InfiniteGrid />
      </main>

      {/* Footer Branding */}
      <footer className="fixed bottom-4 left-4 z-50 text-[10px] uppercase tracking-widest text-muted-foreground opacity-50 font-mono">
        Shadcn Infinite Grid v1.1
      </footer>
    </div>
  );
}
