import React from 'react';
import { BackgroundOption } from '../types/PhotoType';

interface BackgroundSelectorProps {
  options: BackgroundOption[];
  value: string | null;
  onChange: (value: string) => void;
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
        选择背景颜色
      </label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => onChange(option.id)}
            disabled={disabled}
            className={`
              relative p-3 rounded-lg border transition-all duration-200
              ${value === option.id 
                ? 'border-blue-500 ring-2 ring-blue-200' 
                : 'border-gray-200 hover:border-gray-300'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className="flex items-center space-x-3">
              <div
                className="w-6 h-6 rounded-full border border-gray-200"
                style={{ backgroundColor: option.color }}
              />
              <div className="flex-1 text-left">
                <div className="font-medium text-gray-900">{option.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">{option.description}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};