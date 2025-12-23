'use client'

import Link from "next/link";

export default function StatCard({ label, value, desc, href, isWarning = false, icon }: any) {
  return (
    <Link href={href} className="block group">
      <div className={`p-6 bg-white border rounded-lg transition-all hover:shadow-md ${isWarning ? 'border-status-error/50 bg-red-50/50' : 'border-line-200'}`}>
        <div className="flex justify-between items-start mb-2">
          <span className="text-sm font-medium text-label-700">{label}</span>
          <span className="text-xl">{icon}</span>
        </div>
        <div className={`text-3xl font-bold mb-1 ${isWarning ? 'text-status-error' : 'text-label-900'}`}>
          {value}
        </div>
        <div className="text-xs text-label-500 group-hover:text-primary transition-colors">
          {desc} →
        </div>
      </div>
    </Link>
  );
}