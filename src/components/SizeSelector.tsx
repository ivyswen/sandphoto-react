import React from 'react';
import { PhotoType, ContainerType } from '../types/PhotoType';

interface SizeSelectorProps {
  label: string;
  options: (PhotoType | ContainerType)[];
  value: string | undefined;
  onChange: (value: string) => void;
}

export const SizeSelector: React.FC<SizeSelectorProps> = ({ label, options, value, onChange }) => {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      >
        <option value="">-- 请选择 --</option>
        {options.map(option => (
          <option key={option.id} value={option.id}>
            {option.name} ({option.widthCm}×{option.heightCm}厘米)
          </option>
        ))}
      </select>
    </div>
  );
};