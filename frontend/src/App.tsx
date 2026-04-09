import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useDispatch } from "react-redux";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/DashboardPage";
import OAuthCallbackPage from "./pages/OAuthCallbackPage";
import KanbanPage from "./pages/KanbanPage";
import RepoPage from "./pages/RepoPage";
import CommitsPage from "./pages/CommitsPage";
import BlobPage from "./pages/BlobPage";
import DiffPage from "./pages/DiffPage";
import TicketsPage from "./pages/TicketsPage";
import TimerPage from "./pages/TimerPage";
import UserPage from "./pages/UserPage";
import { fetchMe } from "./store/auth";
import { token } from "./store/utils/rest-headers";

const App: React.FC = () => {
  const dispatch = useDispatch();

  // On mount, restore session from localStorage token if present
  useEffect(() => {
    if (token()) {
      (dispatch as any)(fetchMe());
    }
  }, []);

  return (
    <Routes>
      {/* Public routes (no layout chrome) */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LandingPage />} />
      <Route path="/auth/callback" element={<OAuthCallbackPage />} />

      {/* Protected routes - share Layout (Navbar + Sidebar) */}
      <Route element={<Layout />}>
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/:userId" element={<UserPage />} />
          <Route path="/:userId/:repoId/kanban" element={<KanbanPage />} />
          <Route path="/:userId/:repoId/repo" element={<RepoPage />} />
          <Route path="/:userId/:repoId/repo/commits" element={<CommitsPage />} />
          <Route path="/:userId/:repoId/repo/blob" element={<BlobPage />} />
          <Route path="/:userId/:repoId/repo/commit/:sha" element={<DiffPage />} />
          <Route path="/:userId/:repoId/tickets" element={<TicketsPage />} />
          <Route path="/:userId/:repoId/timer" element={<TimerPage />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default App;
