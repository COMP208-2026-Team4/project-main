import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, GitBranch, ChevronDown, GitCommitHorizontal } from "lucide-react";
import Sidebar from "../components/Sidebar";
import { fetchBranches, fetchCommits } from "../store/git";

const relativeTime = (epochSeconds: number) => {
  const diff = Math.floor(Date.now() / 1000) - epochSeconds;
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return `${Math.floor(diff / 2592000)}mo ago`;
};

const CommitsPage: React.FC = () => {
  const { userId, repoId } = useParams<{ userId: string; repoId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const branch = searchParams.get("branch") ?? "main";
  const dispatch = useDispatch() as any;
  const git = useSelector((s: Store.AppState) => s.entities.git);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!userId || !repoId) return;
    setPage(1);
    dispatch(fetchBranches(userId, repoId));
    dispatch(fetchCommits(userId, repoId, branch, 1));
  }, [userId, repoId, branch]);

  const loadMore = () => {
    if (!userId || !repoId) return;
    const next = page + 1;
    setPage(next);
    dispatch(fetchCommits(userId, repoId, branch, next));
  };

  return (
    <>
      <Sidebar variant="repo" />
      <div className="dark:bg-white/8 h-[calc(100vh_-_var(--spacing)_*_16)] grid grid-rows-[auto_auto_1fr] overflow-hidden">
        {/* Breadcrumb */}
        <div className="border-b border-black/20 dark:border-white/20 h-12 px-4 flex items-center gap-2">
          <Link to={`/${userId}/${repoId}/repo`} className="hover:underline flex items-center gap-1">
            <ArrowLeft className="size-4" /> {repoId}
          </Link>
          <span className="opacity-50">/</span>
          <span className="font-bold">commits</span>
        </div>

        {/* Branch bar */}
        <div className="h-12 px-4 flex items-center gap-2 border-b border-black/20 dark:border-white/20">
          <div className="relative grid place-items-center">
            <select
              value={branch}
              onChange={(e) => setSearchParams({ branch: e.target.value })}
              className="appearance-none py-1 pl-8 pr-8 rounded-lg bg-black/10 hover:bg-black/20 dark:bg-white/10 hover:dark:bg-white/20 cursor-pointer font-mono"
            >
              {git.branches.map((b) => <option key={b.name} value={b.name}>{b.name}</option>)}
              {!git.branches.find((b) => b.name === branch) && (
                <option value={branch}>{branch}</option>
              )}
            </select>
            <GitBranch className="size-4 absolute left-2 pointer-events-none" />
            <ChevronDown className="size-4 absolute right-2 pointer-events-none" />
          </div>
          <span className="text-black/60 dark:text-white/60">{git.commits.length} commits</span>
        </div>

        {/* Commits list */}
        <div className="overflow-auto">
          <ul className="divide-y divide-black/10 dark:divide-white/10">
            {git.commits.map((c) => (
              <li key={c.sha} className="px-4 py-3 hover:bg-black/4 dark:hover:bg-white/4 grid grid-cols-[1fr_auto] gap-2">
                <div>
                  <Link
                    to={`/${userId}/${repoId}/repo/commit/${c.sha}`}
                    className="font-bold hover:underline block"
                  >
                    {c.message.split("\n")[0]}
                  </Link>
                  <div className="text-sm text-black/60 dark:text-white/60">
                    <GitCommitHorizontal className="size-4 inline" /> {c.authorName} · {relativeTime(c.timestamp)}
                  </div>
                </div>
                <Link
                  to={`/${userId}/${repoId}/repo/commit/${c.sha}`}
                  className="font-mono text-sm bg-black/10 dark:bg-white/10 px-2 py-1 rounded my-auto h-7 hover:bg-black/20 dark:hover:bg-white/20"
                >
                  {c.sha.slice(0, 8)}
                </Link>
              </li>
            ))}
          </ul>
          {git.commits.length > 0 && git.commits.length % 30 === 0 && (
            <div className="p-4 grid place-items-center">
              <button
                onClick={loadMore}
                className="px-4 py-2 rounded-md bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 cursor-pointer"
              >
                Load more
              </button>
            </div>
          )}
          {git.loading && git.commits.length === 0 && (
            <div className="p-8 text-center text-black/60 dark:text-white/60">Loading commits...</div>
          )}
          {!git.loading && git.commits.length === 0 && (
            <div className="p-8 text-center text-black/60 dark:text-white/60">No commits found.</div>
          )}
        </div>
      </div>
    </>
  );
};

export default CommitsPage;
