import { Routes, Route, Navigate } from 'react-router-dom';
import { WebsitesProvider } from './context/WebsitesContext';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import SubmitFeedback from './pages/SubmitFeedback';
import ManagerDashboard from './pages/ManagerDashboard';
import PainPointDetail from './pages/PainPointDetail';
import WireframeView from './pages/WireframeView';
import ProcessFlowView from './pages/ProcessFlowView';
import AddWebsite from './pages/AddWebsite';
import PublicForm from './pages/PublicForm';

export default function App() {
  return (
    <WebsitesProvider>
      <Routes>
        {/* Standalone shareable form — no app nav, lives outside the Layout */}
        <Route path="/form/:websiteId" element={<PublicForm />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<LandingPage />} />
          <Route path="submit" element={<SubmitFeedback />} />
          <Route path="dashboard" element={<ManagerDashboard />} />
          <Route path="pain-point/:id" element={<PainPointDetail />} />
          <Route path="wireframe/:id" element={<WireframeView />} />
          <Route path="process-flow/:id" element={<ProcessFlowView />} />
          <Route path="add-website" element={<AddWebsite />} />
          {/* Backwards-compatible redirect from the old Connect Repo route */}
          <Route path="connect" element={<Navigate to="/add-website" replace />} />
        </Route>
      </Routes>
    </WebsitesProvider>
  );
}
