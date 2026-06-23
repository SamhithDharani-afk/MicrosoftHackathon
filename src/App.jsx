import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import SubmitFeedback from './pages/SubmitFeedback';
import ManagerDashboard from './pages/ManagerDashboard';
import PainPointDetail from './pages/PainPointDetail';
import WireframeView from './pages/WireframeView';
import ProcessFlowView from './pages/ProcessFlowView';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<LandingPage />} />
        <Route path="submit" element={<SubmitFeedback />} />
        <Route path="dashboard" element={<ManagerDashboard />} />
        <Route path="pain-point/:id" element={<PainPointDetail />} />
        <Route path="wireframe/:id" element={<WireframeView />} />
        <Route path="process-flow/:id" element={<ProcessFlowView />} />
      </Route>
    </Routes>
  );
}
