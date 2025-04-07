import React from 'react';

interface ColorOption {
  id: string;
  name: string;
  value: string;
}

interface LineColorSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export const LineColorSelector: React.FC<LineColorSelectorProps> = ({ value, onChange }) => {
  const colorOptions: ColorOption[] = [
    { id: 'transparent', name: '无分割线', value: 'transparent' },
    { id: 'black', name: '黑色', value: '#000000' },
    { id: 'red', name: '红色', value: '#FF0000' },
    { id: 'blue', name: '蓝色', value: '#0000FF' },
  ];

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">分割线颜色</label>
      <div className="grid grid-cols-4 gap-4">
        {colorOptions.map(color => (
          <button
            key={color.id}
            className={`flex flex-col items-center p-2 rounded-lg border transition-all
              ${value === color.value 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'}`}
            onClick={() => onChange(color.value)}
          >
            <div 
              className="w-6 h-6 rounded-full mb-1"
              style={{ 
                backgroundColor: color.value === 'transparent' ? 'white' : color.value,
                border: color.value === 'transparent' ? '1px dashed #ccc' : 'none'
              }}
            />
            <span className="text-sm text-gray-600">{color.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};