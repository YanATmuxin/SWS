
import React, { useState, useCallback } from 'react';
import { MOCK_HOTELS } from './constants';
import { Hotel, View, ActiveTab, SourceType, HotelStatus } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import HotelList from './components/HotelList';
import HotelDetail from './components/HotelDetail';
import AddResourceModal from './components/AddResourceModal';

const App: React.FC = () => {
  const [view, setView] = useState<View>('list');
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('basic');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleEdit = useCallback((hotel: Hotel) => {
    setSelectedHotel(hotel);
    setView('detail');
    setActiveTab('basic');
  }, []);

  const handleBack = useCallback(() => {
    setView('list');
    setSelectedHotel(null);
  }, []);

  const handleOpenAddModal = () => setIsAddModalOpen(true);
  const handleCloseAddModal = () => setIsAddModalOpen(false);

  const handleFinalizeAdd = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setView('detail');
    setActiveTab('basic');
    setIsAddModalOpen(false);
  };

  return (
    <div className="flex flex-col font-sans text-slate-800 bg-slate-50 h-screen overflow-hidden">
      <Header view={view} hotelName={selectedHotel?.name} onBack={handleBack} />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          {view === 'list' && (
            <div className="px-8 py-4 text-[10px] text-slate-400 border-b border-slate-100 flex items-center font-bold uppercase tracking-widest shrink-0">
              <span className="hover:text-blue-500 cursor-pointer transition-colors">资源管理中心</span>
              <span className="mx-3 opacity-30 text-slate-900">/</span>
              <span className="text-slate-900">酒店信息</span>
            </div>
          )}

          <main className="flex-1 overflow-auto bg-white">
            {view === 'list' ? (
              <div className="p-8">
                <HotelList 
                  hotels={MOCK_HOTELS} 
                  onEdit={handleEdit}
                  onAddNew={handleOpenAddModal}
                />
              </div>
            ) : (
              <HotelDetail 
                hotel={selectedHotel!} 
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onBack={handleBack}
              />
            )}
          </main>
        </div>
      </div>

      {isAddModalOpen && (
        <AddResourceModal 
          onClose={handleCloseAddModal} 
          onConfirm={handleFinalizeAdd} 
        />
      )}
    </div>
  );
};

export default App;
