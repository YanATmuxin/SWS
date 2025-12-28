
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SectionTitleProps {
  title: string;
  icon: LucideIcon;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ title, icon: Icon }) => (
  <div className="flex items-center gap-2 mb-5 pb-2 border-b border-slate-100">
    <Icon className="h-4 w-4 text-slate-400" />
    <h3 className="font-bold text-slate-800 text-sm">{title}</h3>
  </div>
);

export default SectionTitle;
