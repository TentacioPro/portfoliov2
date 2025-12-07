import { twMerge } from 'tailwind-merge';

export function Badge({ children, variant = 'default', className }) {
  const variants = {
    default: 'bg-slate-800 text-slate-300 border-slate-700',
    highlight: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
    warning: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    success: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    danger: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
  };

  return (
    <span
      className={twMerge(
        'px-2 py-1 text-xs font-mono rounded border',
        variants[variant] || variants.default,
        className
      )}
    >
      {children}
    </span>
  );
}
