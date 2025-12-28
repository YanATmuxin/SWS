
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface ComboboxProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}

const Combobox: React.FC<ComboboxProps> = ({
  label, value, onChange, options, placeholder, disabled, required
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes((value || '').toLowerCase())
  );

  return (
    <div className="mb-5 relative group" ref={containerRef}>
      <label className="text-xs font-bold text-slate-600 mb-1.5 block">
        {required && <span className="text-rose-500 mr-1">*</span>}
        {label}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => !disabled && setIsOpen(true)}
          readOnly={disabled}
          placeholder={placeholder || (disabled ? '' : '请选择或输入')}
          className={`block w-full pl-3 pr-8 py-2 border rounded text-sm transition-all outline-none ${
             disabled 
              ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed' 
              : 'border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 text-slate-800 bg-white'
          }`}
        />
        <div 
          className={`absolute right-0 top-0 bottom-0 px-2 flex items-center justify-center ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180 text-blue-500' : 'text-slate-400'}`} />
        </div>

        {/* Dropdown Menu */}
        {isOpen && !disabled && (
          <div className="absolute z-50 left-0 right-0 top-[calc(100%+4px)] bg-white border border-slate-200 rounded shadow-xl max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt}
                  onClick={() => handleSelect(opt)}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 flex items-center justify-between ${value === opt ? 'text-blue-600 font-bold bg-blue-50/50' : 'text-slate-700'}`}
                >
                  <span>{opt}</span>
                  {value === opt && <Check className="h-3.5 w-3.5" />}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-xs text-slate-400">
                按 "{value}" 保存为新选项
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Combobox;
