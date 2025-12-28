
import React from 'react';
import { HotelStatus } from '../types';

interface StatusBadgeProps {
  status: HotelStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  // 遵循设计规范中的 "状态样式2" (圆点 + 文字)
  const styles = {
    [HotelStatus.OPERATING]: 'text-emerald-600',
    [HotelStatus.PREPARING]: 'text-blue-600',
    [HotelStatus.OFFLINE]: 'text-slate-400',
  };

  const dots = {
    [HotelStatus.OPERATING]: 'bg-emerald-500',
    [HotelStatus.PREPARING]: 'bg-blue-500',
    [HotelStatus.OFFLINE]: 'bg-slate-300',
  };
  
  const labels = {
    [HotelStatus.OPERATING]: '已上架',
    [HotelStatus.PREPARING]: '筹备中',
    [HotelStatus.OFFLINE]: '已下架',
  };

  return (
    <div className={`flex items-center gap-2 text-xs font-medium ${styles[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[status]}`}></span>
      {labels[status]}
    </div>
  );
};

export default StatusBadge;
