import React, { useMemo } from 'react';
import katex from 'katex';

interface MathRendererProps {
  latex: string;
  displayMode?: boolean;
  className?: string;
}

export const MathRenderer: React.FC<MathRendererProps> = ({
  latex,
  displayMode = true,
  className = '',
}) => {
  const html = useMemo(() => {
    try {
      // Strip outer $$ or $ if present
      let clean = latex.trim();
      if (clean.startsWith('$$') && clean.endsWith('$$')) {
        clean = clean.slice(2, -2).trim();
      } else if (clean.startsWith('$') && clean.endsWith('$')) {
        clean = clean.slice(1, -1).trim();
      }
      return katex.renderToString(clean, {
        displayMode,
        throwOnError: false,
        strict: false,
      });
    } catch (e) {
      console.warn('KaTeX rendering fallback:', e);
      return `<span class="font-mono text-slate-800">${latex}</span>`;
    }
  }, [latex, displayMode]);

  return (
    <div
      className={`overflow-x-auto select-text ${displayMode ? 'my-2 text-center py-1' : 'inline-block'} ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
