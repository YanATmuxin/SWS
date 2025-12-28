
import React from 'react';
import { LogOut, Mail } from 'lucide-react';

interface HeaderProps {
  view: string;
  hotelName?: string;
  onBack: () => void;
}

const Header: React.FC<HeaderProps> = ({ view, hotelName, onBack }) => {
  return (
    <header className="bg-[#242f3d] h-[60px] flex items-center justify-between px-6 text-white z-20 shrink-0">
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
           {/* Spring Tour Logo */}
           <img 
             src="https://res.springtour.com/chunqiu/offline/images/supplier/logo.png" 
             alt="春秋旅游" 
             className="h-8 w-auto object-contain"
           />
           <div className="mx-6 h-6 w-px bg-white/20"></div>
           <span className="text-xl font-medium">C-Booking 供应商系统</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-6 text-sm">
        <div className="bg-[#4a90e2] px-3 py-1 rounded flex items-center cursor-pointer hover:bg-[#357abd] transition-colors">
          <Mail className="h-4 w-4 mr-2" />
          <span>站内信</span>
          <span className="ml-2 font-bold">0</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="opacity-70">您好！</span>
          <span className="font-bold underline cursor-pointer">潘艳(031299) 上海春秋旅行社有限公司 总经办</span>
        </div>

        <div className="mx-2 h-4 w-px bg-white/20"></div>
        
        <button className="flex items-center hover:text-[#4a90e2] transition-colors">
          <LogOut className="h-4 w-4 mr-2" />
          <span>退出</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
