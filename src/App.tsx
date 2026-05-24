/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './store';
import { Layout } from './components/layout/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import Applications from './pages/Applications';
import SavedJobs from './pages/SavedJobs';
import CompanyNotes from './pages/CompanyNotes';
import Statistics from './pages/Statistics';
import Reminders from './pages/Reminders';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="applications" element={<Applications />} />
            <Route path="saved" element={<SavedJobs />} />
            <Route path="company-notes" element={<CompanyNotes />} />
            <Route path="statistics" element={<Statistics />} />
            <Route path="reminders" element={<Reminders />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
