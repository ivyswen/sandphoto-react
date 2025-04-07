import React from 'react';
import { BackgroundOption } from '../types/PhotoType';

interface BackgroundSelectorProps {
  options: BackgroundOption[];
  value: string | null;
  onChange: (backgroundId: string) => void;
  disabled?: boolean;
}

export const BackgroundSelector: React.FC<BackgroundSelectorProps> = ({
  options,
  value,
  onChange,
  disabled = false
}) => {
  if (options.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        选择照片背景颜色
      </label>
      <div className="grid grid-cols-4 gap-2">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(option.id)}
            className={`
              w-full h-12 rounded-md border-2 transition-all
              ${value === option.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-300'}
            `}
            style={{ backgroundColor: option.color }}
            title={option.name}
          >
            <span className="sr-only">{option.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};