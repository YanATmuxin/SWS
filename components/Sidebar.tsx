
import React, { useState } from 'react';
import { 
  ClipboardCheck, Building, FileBox, 
  ShoppingCart, ChevronDown, 
  ChevronRight, CreditCard, Settings
} from 'lucide-react';

const Sidebar: React.FC = () => {
  // 默认展开资源管理
  const [expanded, setExpanded] = useState<string | null>('resource');
  const [activeItem, setActiveItem] = useState('hotel-list');

  const menuGroups = [
    {
      id: 'todo',
      title: '待处理',
      icon: ClipboardCheck,
      items: [
        { id: 'timeout', label: '超时新单提醒', count: 5 },
        { id: 'confirm', label: '待确认订单', count: 99 },
      ]
    },
    {
      id: 'resource',
      title: '资源管理',
      icon: Building,
      items: [
        { id: 'hotel-list', label: '酒店信息' },
        { id: 'room-list', label: '房型列表' },
        { id: 'rates', label: '房态房价' },
      ]
    },
    {
      id: 'single',
      title: '单项资源',
      icon: FileBox,
      items: [
        { id: 'resource-list', label: '资源列表' },
        { id: 'single-price', label: '价格库存' },
      ]
    },
    {
      id: 'transaction',
      title: '交易管理',
      icon: ShoppingCart,
      items: [
        { id: 'order-query', label: '订单查询' },
        { id: 'pending-confirm', label: '待确认订单' },
        { id: 'refunds', label: '退改管理' },
        { id: 'feedback', label: '入住反馈' },
      ]
    },
    {
      id: 'finance',
      title: '财务结算',
      icon: CreditCard,
      items: [
        { id: 'statements', label: '结算单' },
        { id: 'invoices', label: '发票管理' },
        { id: 'balance', label: '账户余额' },
      ]
    },
    {
      id: 'system',
      title: '系统与设置',
      icon: Settings,
      items: [
        { id: 'account', label: '账号管理' },
        { id: 'logs', label: '操作日志' },
      ]
    },
  ];

  const toggleGroup = (id: string) => {
    setExpanded(expanded === id ? null : id);
  };

  return (
    <div className="w-[240px] bg-white border-r border-slate-200 flex flex-col h-full text-sm">
      <div className="flex-1 overflow-y-auto py-2">
        {menuGroups.map((group) => (
          <div key={group.id} className="mb-1">
            <div 
              onClick={() => toggleGroup(group.id)}
              className={`flex items-center px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors ${expanded === group.id ? 'text-slate-800 font-bold' : 'text-slate-600'}`}
            >
              <group.icon className="h-4 w-4 mr-2.5 opacity-70" />
              <span className="flex-1">{group.title}</span>
              {group.items.length > 0 && (
                expanded === group.id ? <ChevronDown className="h-3.5 w-3.5 opacity-50" /> : <ChevronRight className="h-3.5 w-3.5 opacity-50" />
              )}
            </div>

            {expanded === group.id && (
              <div className="bg-slate-50/50 py-1">
                {group.items.map((item) => {
                  const isActive = activeItem === item.id;
                  return (
                    <div 
                      key={item.id}
                      onClick={() => setActiveItem(item.id)}
                      className={`relative flex items-center justify-between pl-11 pr-4 py-2.5 cursor-pointer transition-all
                        ${isActive 
                          ? 'bg-blue-50 text-blue-600 font-medium' 
                          : 'text-slate-600 hover:text-blue-600 hover:bg-slate-100'
                        }`}
                    >
                      {isActive && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-blue-600"></div>}
                      <span>{item.label}</span>
                      {'count' in item && (
                        <span className="bg-rose-500 text-white text-[10px] px-1.5 h-4 flex items-center justify-center rounded-sm min-w-[18px]">
                          {item.count > 99 ? '99+' : item.count}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t border-slate-100 text-xs text-slate-400 text-center">
        v2.5.0 Build 20250102
      </div>
    </div>
  );
};

export default Sidebar;
