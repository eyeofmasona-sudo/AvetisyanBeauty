import React from 'react';
import { BarChart3 } from 'lucide-react';

export function Analytics() {
  return (
    <div className="text-center text-graphite/60 py-12">
      <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
      <p>AI performance analytics will be implemented here.</p>
    </div>
  );
}
