import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import POSPage from './pages/POSPage';
import InventoryPage from './pages/InventoryPage';
import SalesHistoryPage from './pages/SalesHistoryPage';
import DashboardPage from './pages/DashboardPage';
import ProfitabilityPage from './pages/ProfitabilityPage';
import StockMovementPage from './pages/StockMovementPage';
import SuppliersPage from './pages/SuppliersPage';
import FinancialReportsPage from './pages/FinancialReportsPage';
import NotificationCenter from './components/NotificationCenter';
import SyncStatus from './components/SyncStatus';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<POSPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/history" element={<SalesHistoryPage />} />
          <Route path="/profitability" element={<ProfitabilityPage />} />
          <Route path="/stock-movements" element={<StockMovementPage />} />
          <Route path="/suppliers" element={<SuppliersPage />} />
          <Route path="/financial-reports" element={<FinancialReportsPage />} />
        </Routes>
      </Layout>
      {/* Notificaciones flotantes (se desvanecen automáticamente) */}
      <NotificationCenter />
      {/* Indicador de estado de sincronización */}
      <SyncStatus />
    </BrowserRouter>
  );
}

export default App;
