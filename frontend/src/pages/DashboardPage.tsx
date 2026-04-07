import { useState } from "react";
import { useSelector } from "react-redux";
import Sidebar from "../components/Sidebar";
import CreateRepoModal from "../components/CreateRepoModal";
import { selectUser } from "../store/auth";

/**
 * Dashboard — the main protected page shown after login.
 * Previously named HomePage; now a proper authenticated view.
 */
const DashboardPage: React.FC = () => {
  const user = useSelector(selectUser);
  const [showCreateRepo, setShowCreateRepo] = useState(false);

  return (
    <>
      <Sidebar variant="home" />
      <div className="grid grid-rows-[auto_auto_1fr] dark:bg-white/8 p-8 gap-4 text-lg">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-[500]">
            Welcome back{user ? `, ${user.username}` : ""}
          </h1>
          <button
            onClick={() => setShowCreateRepo(true)}
            className="px-4 py-2 rounded-md bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium transition-colors">
            + New Repository
          </button>
        </div>

        <p className="text-black/60 dark:text-white/60 text-base">
          Your repositories and recent activity will appear here.
        </p>

        {/* Placeholder for repository list */}
        <div className="grid gap-3 content-start">
          <div className="rounded-lg border border-black/10 dark:border-white/10 p-4 text-sm text-black/40 dark:text-white/40">
            No repositories yet. Create one to get started.
          </div>
        </div>
      </div>

      {showCreateRepo && (
        <CreateRepoModal onClose={() => setShowCreateRepo(false)} />
      )}
    </>
  );
};

export default DashboardPage;
