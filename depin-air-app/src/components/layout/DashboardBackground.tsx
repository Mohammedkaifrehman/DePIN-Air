'use client';

import React from 'react';

export default function DashboardBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden bg-[#080808]">
      {/* Background glows - Synced with Landing Page */}
      <div className="absolute top-1/4 left-1/4 w-[700px] h-[700px] bg-[#b026ff]/10 rounded-full blur-[180px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[700px] h-[700px] bg-[#00f5ff]/10 rounded-full blur-[180px]" />
    </div>
  );
}
