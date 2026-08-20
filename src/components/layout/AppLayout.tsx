import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { MobileNavigation } from './MobileNavigation';

export function AppLayout() {
  return (
    <div className="flex h-screen w-full bg-brand-gray overflow-hidden">
      {/* Desktop Sidebar */}
      <AppSidebar />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0 relative">
        <div className="max-w-7xl mx-auto w-full min-h-full">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNavigation />
    </div>
  );
}
