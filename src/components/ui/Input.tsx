import type { InputHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function Input({ label, className = '', id, ...props }: InputProps) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="text-sm text-zinc-300">
          {label}
        </label>
      )}

      <input
        id={id}
        className={`mt-1 w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-white/30 ${className}`}
        {...props}
      />
    </div>
  );
}
