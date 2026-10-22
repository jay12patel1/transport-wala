import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Search, Bookmark, Truck, PlusCircle, 
  FileText, Wallet, ShieldCheck, User, Compass 
} from 'lucide-react';

export const BottomNavigation: React.FC = () => {
  const { role, screen, setScreen, t } = useApp();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 shadow-lg">
      <div className="flex items-center justify-around">
        {role === 'customer' && (
          <>
            <button
              onClick={() => setScreen('home')}
              className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
                screen === 'home' || screen === 'search_results' ? 'text-blue-600 font-bold' : 'text-slate-500'
              }`}
            >
              <Search className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">{t('navSearch')}</span>
            </button>

            <button
              onClick={() => setScreen('bookings')}
              className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
                screen === 'bookings' ? 'text-blue-600 font-bold' : 'text-slate-500'
              }`}
            >
              <Bookmark className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">{t('navMyBookings')}</span>
            </button>

            <button
              onClick={() => setScreen('profile')}
              className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
                screen === 'profile' ? 'text-blue-600 font-bold' : 'text-slate-500'
              }`}
            >
              <User className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">{t('navProfile')}</span>
            </button>
          </>
        )}

        {role === 'transporter' && (
          <>
            <button
              onClick={() => setScreen('transporter_dashboard')}
              className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
                screen === 'transporter_dashboard' ? 'text-blue-600 font-bold' : 'text-slate-500'
              }`}
            >
              <Truck className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Overview</span>
            </button>

            <button
              onClick={() => setScreen('my_vehicles')}
              className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
                screen === 'my_vehicles' || screen === 'add_vehicle' ? 'text-blue-600 font-bold' : 'text-slate-500'
              }`}
            >
              <PlusCircle className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">{t('navMyVehicles')}</span>
            </button>

            <button
              onClick={() => setScreen('my_drivers')}
              className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
                screen === 'my_drivers' ? 'text-blue-600 font-bold' : 'text-slate-500'
              }`}
            >
              <User className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Drivers</span>
            </button>

            <button
              onClick={() => setScreen('my_documents')}
              className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
                screen === 'my_documents' ? 'text-blue-600 font-bold' : 'text-slate-500'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">{t('navDocuments')}</span>
            </button>

            <button
              onClick={() => setScreen('earnings')}
              className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
                screen === 'earnings' ? 'text-blue-600 font-bold' : 'text-slate-500'
              }`}
            >
              <Wallet className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">{t('navEarnings')}</span>
            </button>
          </>
        )}

        {role === 'driver' && (
          <>
            <button
              onClick={() => setScreen('driver_mode')}
              className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
                screen === 'driver_mode' ? 'text-amber-600 font-bold' : 'text-slate-500'
              }`}
            >
              <Compass className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Trip Dashboard</span>
            </button>

            <button
              onClick={() => setScreen('profile')}
              className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
                screen === 'profile' ? 'text-amber-600 font-bold' : 'text-slate-500'
              }`}
            >
              <User className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Driver Profile</span>
            </button>
          </>
        )}

        {role === 'admin' && (
          <>
            <button
              onClick={() => setScreen('admin_dashboard')}
              className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
                screen === 'admin_dashboard' ? 'text-purple-600 font-bold' : 'text-slate-500'
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Analytics</span>
            </button>

            <button
              onClick={() => setScreen('admin_docs')}
              className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
                (screen === 'admin_docs' || screen === 'admin_documents') ? 'text-purple-600 font-bold' : 'text-slate-500'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Verify Docs</span>
            </button>

            <button
              onClick={() => setScreen('admin_settlements')}
              className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
                screen === 'admin_settlements' ? 'text-purple-600 font-bold' : 'text-slate-500'
              }`}
            >
              <Wallet className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Payouts</span>
            </button>

            <button
              onClick={() => setScreen('profile')}
              className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
                screen === 'profile' ? 'text-purple-600 font-bold' : 'text-slate-500'
              }`}
            >
              <User className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Admin</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
