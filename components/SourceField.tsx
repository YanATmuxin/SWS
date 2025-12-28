
import React, { useState, useEffect } from 'react';
import { AlertCircle, X, CheckCircle2, Search, ArrowRight, Download, Eye } from 'lucide-react';
import { SourceType } from '../types';

export interface ValidationFeedback {
  type: 'EXISTING_INTERNAL' | 'EXISTING_EXTERNAL';
  message: string;
  data?: any;
}

interface SourceFieldProps {
  label: string;
  value: string;
  source: SourceType;
  conflictValue?: string;
  apiSource?: string;
  readOnly?: boolean;
  type?: "text" | "textarea" | "date" | "month";
  required?: boolean;
  onBlur?: (val: string) => void;
  validationFeedback?: ValidationFeedback | null;
  onValidationAction?: (feedback: ValidationFeedback) => void;
  onChange?: (val: string) => void; // Add support for controlled updates
}

const SourceField: React.FC<SourceFieldProps> = ({ 
  label, value, source, conflictValue, apiSource, readOnly = false, type = "text", required = false,
  onBlur, validationFeedback, onValidationAction, onChange
}) => {
  const [currentValue, setCurrentValue] = useState(value);
  const [showDiff, setShowDiff] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Sync internal state if prop value changes (e.g., from validation import)
  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  // 权限逻辑: 
  // - L4 (业务录入): 可编辑
  // - 其他 (系统同步): 不可编辑 (Read Only)
  const isBusinessEntry = source === SourceType.L4;
  const isSystemSync = !isBusinessEntry;
  const isDisabled = isSystemSync || readOnly;

  // 冲突显示逻辑: 仅在业务录入(L4) 且 有冲突值时显示
  const hasConflict = isBusinessEntry && !!conflictValue;

  const handleAdopt = () => {
    if (conflictValue) {
      setCurrentValue(conflictValue);
      setShowDiff(false);
      if (onChange) onChange(conflictValue);
    }
  };

  const handleManualEdit = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCurrentValue(e.target.value);
    if (!isEditing) setIsEditing(true);
    if (onChange) onChange(e.target.value);
  };

  const handleBlur = () => {
    // 自动保存逻辑：失焦即视为确认
    if (isEditing) {
      setIsEditing(false);
    }
    if (onBlur) {
      onBlur(currentValue);
    }
  };

  return (
    <div className={`mb-5 relative group`}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1">
          <label className="text-xs font-bold text-slate-600">
            {required && <span className="text-rose-500 mr-1">*</span>}
            {label}
          </label>
        </div>

        {hasConflict && (
          <button 
            onClick={() => setShowDiff(!showDiff)}
            className="flex items-center gap-1 text-[10px] bg-amber-50 text-amber-600 border border-amber-200 px-1.5 py-0.5 rounded hover:bg-amber-100 transition-colors animate-pulse"
          >
            <AlertCircle className="h-3 w-3" /> 差异待决
          </button>
        )}
      </div>
      
      <div className="relative">
        {type === 'textarea' ? (
           <textarea
            rows={3}
            value={currentValue}
            onChange={handleManualEdit}
            onBlur={handleBlur}
            readOnly={isDisabled}
            className={`block w-full px-3 py-2 border rounded text-sm transition-all outline-none ${
              isDisabled 
                ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed resize-none' 
                : 'border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 text-slate-800 bg-white'
            }`}
           />
        ) : (
          <input
            type={type}
            value={currentValue}
            onChange={handleManualEdit}
            onBlur={handleBlur}
            readOnly={isDisabled}
            className={`block w-full px-3 py-2 border rounded text-sm transition-all outline-none ${
               isDisabled 
                ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed' 
                : 'border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 text-slate-800 bg-white'
            }`}
          />
        )}

        {/* 智能校验反馈 UI */}
        {validationFeedback && (
          <div className={`mt-2 p-3 rounded border text-xs flex items-center justify-between animate-in slide-in-from-top-2 ${
            validationFeedback.type === 'EXISTING_INTERNAL' 
              ? 'bg-blue-50 border-blue-200 text-blue-700' 
              : 'bg-orange-50 border-orange-200 text-orange-700'
          }`}>
            <div className="flex items-center gap-2">
              {validationFeedback.type === 'EXISTING_INTERNAL' 
                 ? <AlertCircle className="h-4 w-4 shrink-0" />
                 : <Search className="h-4 w-4 shrink-0" />
              }
              <span>{validationFeedback.message}</span>
            </div>
            
            {onValidationAction && (
              <button 
                onClick={() => onValidationAction(validationFeedback)}
                className={`px-3 py-1 rounded font-bold flex items-center gap-1 transition-colors shadow-sm ${
                  validationFeedback.type === 'EXISTING_INTERNAL'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-orange-500 text-white hover:bg-orange-600'
                }`}
              >
                 {validationFeedback.type === 'EXISTING_INTERNAL' ? (
                   <>
                     <Eye className="h-3 w-3" /> 去查看
                   </>
                 ) : (
                   <>
                     <Download className="h-3 w-3" /> 一键导入
                   </>
                 )}
              </button>
            )}
          </div>
        )}

        {/* 冲突 Diff 面板 */}
        {showDiff && (
          <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded shadow-xl p-3 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-700">数据冲突解决</span>
              <button onClick={() => setShowDiff(false)}><X className="h-3.5 w-3.5 text-slate-400" /></button>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
               <div className="p-2 bg-slate-50 rounded border border-slate-200">
                  <span className="block text-[10px] text-slate-400 mb-0.5">当前业务录入值</span>
                  <div className="text-xs font-medium text-slate-600 break-all">{currentValue}</div>
               </div>
               <div className="p-2 bg-blue-50 rounded border border-blue-100">
                  <span className="block text-[10px] text-blue-400 mb-0.5">系统最新同步 ({apiSource})</span>
                  <div className="text-xs font-bold text-blue-700 break-all">{conflictValue}</div>
               </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={handleAdopt}
                className="flex-1 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
              >
                采纳系统值 (覆盖)
              </button>
              <button 
                onClick={() => setShowDiff(false)}
                className="flex-1 py-1.5 bg-white border border-slate-300 text-slate-600 text-xs rounded hover:bg-slate-50 transition-colors"
              >
                保留业务值
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SourceField;
