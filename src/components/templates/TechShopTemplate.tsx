import React from 'react';
import { Tenant } from '@/lib/supabase/tenants';

export interface TemplateProps {
  tenant: Tenant;
}

export default function BaseTemplate({ tenant }: TemplateProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">{tenant.business_name}</h1>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">Welcome to {tenant.business_name}</h2>
          <p className="text-gray-600">
            This is a placeholder for the {tenant.industry_type.replace(/_/g, ' ')} template.
          </p>
          <p className="text-gray-600 mt-4">
            Industry: {tenant.industry_type.replace(/_/g, ' ').toUpperCase()}
          </p>
        </div>
      </main>
      
      <footer className="bg-gray-800 text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center">© {new Date().getFullYear()} {tenant.business_name}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}