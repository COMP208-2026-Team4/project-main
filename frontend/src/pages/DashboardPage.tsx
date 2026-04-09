import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import CreateRepoModal from "../components/CreateRepoModal";
import { selectUser } from "../store/auth";
import { getHeaders } from "../store/utils/rest-headers";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

interface Repository {
  id: string;
  name: string;
  owner: string;
  path: string;
  created_at: string;
}

/**
 * Dashboard - the main protected page shown after login.
 * Previously named HomePage; now a proper authenticated view.
 */
const DashboardPage: React.FC = () => {
  const user = useSelector(selectUser);
  const [showCreateRepo, setShowCreateRepo] = useState(false);
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(true);

  const fetchRepos = async () => {
    setLoadingRepos(true);
    try {
      const res = await fetch(`${API_URL}/repositories`, {
        headers: getHeaders(),
      });
      if (res.ok) {
        setRepos(await res.json());
      }
    } finally {
      setLoadingRepos(false);
    }
  };

  useEffect(() => {
    fetchRepos();
  }, []);

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

        <div className="grid gap-3 content-start">
          {loadingRepos ? (
            <div className="rounded-lg border border-black/10 dark:border-white/10 p-4 text-sm text-black/40 dark:text-white/40">
              Loading repositories…
            </div>
          ) : repos.length === 0 ? (
            <div className="rounded-lg border border-black/10 dark:border-white/10 p-4 text-sm text-black/40 dark:text-white/40">
              No repositories yet. Create one to get started.
            </div>
          ) : (
            repos.map((repo) => (
              <Link
                key={repo.id}
                to={`/${repo.owner}/${repo.name}/repo`}
                className="rounded-lg border border-black/10 dark:border-white/10 p-4 text-sm grid gap-1 transition-colors hover:bg-black/4 dark:hover:bg-white/6 hover:border-black/20 dark:hover:border-white/20">
                <div className="flex items-center justify-between">
                  <span className="font-medium dark:text-white">{repo.name}</span>
                  {repo.created_at && (
                    <span className="text-black/40 dark:text-white/40 text-xs">
                      {new Date(repo.created_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <span className="text-black/45 dark:text-white/45 text-xs font-mono">
                  {repo.owner}/{repo.name}
                </span>
              </Link>
            ))
          )}
        </div>
      </div>

      {showCreateRepo && (
        <CreateRepoModal onClose={() => {
          setShowCreateRepo(false);
          fetchRepos();
        }} />
      )}
    </>
  );
};

export default DashboardPage;
