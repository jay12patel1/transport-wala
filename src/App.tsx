import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { UserRole } from './types';
import { Header } from './components/Header';
import { BottomNavigation } from './components/BottomNavigation';
import { SecurityAlertBanner } from './components/shared/SecurityAlertBanner';
import { AboutModal } from './components/shared/AboutModal';

// Public & Auth Screens
import { PublicLanding } from './components/public/PublicLanding';
import { LoginScreen } from './components/auth/LoginScreen';
import { SignUpScreen } from './components/auth/SignUpScreen';

// Customer screens
import { CustomerHome } from './components/customer/CustomerHome';
import { CustomerBookings } from './components/customer/CustomerBookings';

// Transporter screens
import { TransporterDashboard } from './components/transporter/TransporterDashboard';
import { MyVehicles } from './components/transporter/MyVehicles';
import { MyDocuments } from './components/transporter/MyDocuments';
import { MyDrivers } from './components/transporter/MyDrivers';
import { TransporterEarnings } from './components/transporter/TransporterEarnings';

// Driver & Admin screens
import { DriverMode } from './components/driver/DriverMode';
import { AdminDashboard } from './components/admin/AdminDashboard';

// Profile screen
import { ProfileScreen } from './components/profile/ProfileScreen';

import { CheckCircle2 } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { 
    role, 
    screen, 
    setScreen, 
    navigateProtected, 
    isAuthenticated, 
    toastMessage, 
    adminSettings 
  } = useApp();
  
  const [showAbout, setShowAbout] = useState(false);
  const [loginInitialRole, setLoginInitialRole] = useState<UserRole>('customer');

  // Sync with window.location.hash for URL-based role routing & direct link access
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '').trim();
      if (!hash) {
        if (!isAuthenticated) navigateProtected('landing');
        return;
      }

      if (hash === 'landing' || hash === '') {
        navigateProtected('landing');
      } else if (hash === 'login' || hash.startsWith('login')) {
        if (hash.includes('driver')) setLoginInitialRole('driver');
        else if (hash.includes('transporter')) setLoginInitialRole('transporter');
        else if (hash.includes('admin')) setLoginInitialRole('admin');
        else if (hash.includes('customer')) setLoginInitialRole('customer');
        navigateProtected('login');
      } else if (hash === 'signup') {
        navigateProtected('signup');
      } else if (hash.startsWith('customer')) {
        if (!isAuthenticated) { setLoginInitialRole('customer'); navigateProtected('login'); return; }
        if (hash.includes('bookings')) navigateProtected('bookings');
        else navigateProtected('home');
      } else if (hash.startsWith('transporter')) {
        if (!isAuthenticated) { setLoginInitialRole('transporter'); navigateProtected('login'); return; }
        if (hash.includes('vehicles')) navigateProtected('my_vehicles');
        else if (hash.includes('drivers')) navigateProtected('my_drivers');
        else if (hash.includes('documents')) navigateProtected('my_documents');
        else if (hash.includes('earnings')) navigateProtected('earnings');
        else navigateProtected('transporter_dashboard');
      } else if (hash.startsWith('driver')) {
        if (!isAuthenticated) { setLoginInitialRole('driver'); navigateProtected('login'); return; }
        navigateProtected('driver_mode');
      } else if (hash.startsWith('admin')) {
        if (!isAuthenticated) { setLoginInitialRole('admin'); navigateProtected('login'); return; }
        navigateProtected('admin_dashboard');
      } else if (hash === 'profile') {
        navigateProtected('profile');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [navigateProtected, isAuthenticated]);

  // Update hash when screen changes
  useEffect(() => {
    if (!isAuthenticated) {
      if (screen === 'login') window.location.hash = '#/login';
      else if (screen === 'signup') window.location.hash = '#/signup';
      else window.location.hash = '#/';
      return;
    }

    if (screen === 'profile') {
      window.location.hash = '#/profile';
    } else if (role === 'customer') {
      window.location.hash = screen === 'bookings' ? '#/customer/bookings' : '#/customer/home';
    } else if (role === 'transporter') {
      if (screen === 'my_vehicles') window.location.hash = '#/transporter/vehicles';
      else if (screen === 'my_drivers') window.location.hash = '#/transporter/drivers';
      else if (screen === 'my_documents') window.location.hash = '#/transporter/documents';
      else if (screen === 'earnings') window.location.hash = '#/transporter/earnings';
      else window.location.hash = '#/transporter/dashboard';
    } else if (role === 'driver') {
      window.location.hash = '#/driver/dashboard';
    } else if (role === 'admin') {
      window.location.hash = '#/admin/dashboard';
    }
  }, [screen, role, isAuthenticated]);

  // Unauthenticated Views
  if (!isAuthenticated) {
    if (screen === 'signup') {
      return (
        <SignUpScreen 
          onSwitchToLogin={() => setScreen('login')}
          onBackToHome={() => setScreen('landing')}
        />
      );
    }
    if (screen === 'login') {
      return (
        <LoginScreen 
          initialRole={loginInitialRole}
          onSwitchToSignup={(roleHint) => {
            if (roleHint && roleHint !== 'admin') {
              // optional role hint for signup
            }
            setScreen('signup');
          }}
          onBackToHome={() => setScreen('landing')}
        />
      );
    }
    // Default to Public Landing Page
    return (
      <PublicLanding 
        onOpenLogin={(roleHint) => {
          if (roleHint && (roleHint === 'customer' || roleHint === 'transporter' || roleHint === 'driver' || roleHint === 'admin')) {
            setLoginInitialRole(roleHint as UserRole);
          }
          setScreen('login');
        }}
        onOpenSignup={() => setScreen('signup')}
      />
    );
  }

  const renderScreen = () => {
    // Shared profile screen
    if (screen === 'profile') {
      return <ProfileScreen />;
    }

    // Role-specific routing with authorization boundaries
    if (role === 'customer') {
      switch (screen) {
        case 'bookings':
          return <CustomerBookings />;
        case 'home':
        default:
          return <CustomerHome />;
      }
    }

    if (role === 'transporter') {
      switch (screen) {
        case 'my_vehicles':
          return <MyVehicles />;
        case 'my_drivers':
          return <MyDrivers />;
        case 'my_documents':
          return <MyDocuments />;
        case 'earnings':
          return <TransporterEarnings />;
        case 'transporter_dashboard':
        case 'home':
        default:
          return <TransporterDashboard />;
      }
    }

    if (role === 'driver') {
      return <DriverMode />;
    }

    if (role === 'admin') {
      return <AdminDashboard />;
    }

    return <CustomerHome />;
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 pb-20 md:pb-8">
      {/* Security Alert Banner for unauthorized route access attempts */}
      <SecurityAlertBanner />

      {/* App Header */}
      <Header onOpenAbout={() => setShowAbout(true)} />

      {/* Main Content Area */}
      <main className="flex-1">
        {renderScreen()}
      </main>

      {/* Footer */}
      <footer className="hidden md:block bg-white border-t border-slate-200 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900">Transport Wala</span>
            <span>•</span>
            <span>Commercial Vehicle Booking &amp; Fleet Management</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span>Developed by</span>
            <strong className="text-slate-800 font-bold">{adminSettings.appDeveloper || 'Jayesh Patel'}</strong>
            <span>({adminSettings.appContactNumber || '9725506630'})</span>
            <span>•</span>
            <a href="mailto:support@transportswala.com" className="text-blue-600 hover:underline font-semibold">
              support@transportswala.com
            </a>
          </div>

          <div className="flex items-center gap-3 text-slate-400">
            <button onClick={() => setShowAbout(true)} className="hover:text-slate-700 underline">
              About Platform
            </button>
            <span>•</span>
            <span>All India Logistics Protocol</span>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <BottomNavigation />

      {/* Toast Notification Popup */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-8 right-4 z-50 bg-slate-950 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-3 text-xs font-semibold animate-in fade-in slide-in-from-bottom duration-200 max-w-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* About Modal */}
      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
