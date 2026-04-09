import { useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft } from "lucide-react";
import Sidebar from "../components/Sidebar";
import { fetchDiff } from "../store/git";
import { selectUser } from "../store/auth";

const formatDate = (epochSeconds: number) =>
  new Date(epochSeconds * 1000).toLocaleString();

const lineClass = (line: string) => {
  if (line.startsWith("+++") || line.startsWith("---")) return "text-black/60 dark:text-white/60";
  if (line.startsWith("+")) return "text-green-700 dark:text-green-400 bg-green-500/10";
  if (line.startsWith("-")) return "text-red-700 dark:text-red-400 bg-red-500/10";
  if (line.startsWith("@@")) return "text-blue-700 dark:text-blue-400 bg-blue-500/10";
  return "text-black/80 dark:text-white/80";
};

const DiffPage: React.FC = () => {
  const { userId, repoId, sha } = useParams<{ userId: string; repoId: string; sha: string }>();
  const dispatch = useDispatch() as any;
  const diff = useSelector((s: Store.AppState) => s.entities.git.diff);
  const loading = useSelector((s: Store.AppState) => s.entities.git.loading);
  const user = useSelector(selectUser);

  useEffect(() => {
    // Wait for auth hydration to complete before firing the diff request -
    // direct-loading /commit/:sha used to race the JWT resolution.
    if (user && userId && repoId && sha)
      dispatch(fetchDiff(userId, repoId, sha));
  }, [user?.id, userId, repoId, sha]);

  const lines = useMemo(() => (diff?.diff ?? "").split("\n"), [diff]);

  return (
    <>
      <Sidebar variant="repo" />
      <div className="dark:bg-white/8 h-[calc(100vh_-_var(--spacing)_*_16)] grid grid-rows-[auto_auto_1fr] overflow-hidden">
        {/* Breadcrumb */}
        <div className="border-b border-black/20 dark:border-white/20 h-12 px-4 flex items-center gap-2">
          <Link to={`/${userId}/${repoId}/repo/commits`} className="hover:underline flex items-center gap-1">
            <ArrowLeft className="size-4" /> commits
          </Link>
          <span className="opacity-50">/</span>
          <span className="font-mono font-bold">{sha?.slice(0, 8)}</span>
        </div>

        {/* Commit metadata */}
        <div className="p-4 border-b border-black/20 dark:border-white/20">
          {loading && !diff && <div className="text-black/60 dark:text-white/60">Loading...</div>}
          {diff && (
            <>
              <div className="font-bold text-lg mb-1">{diff.message.split("\n")[0]}</div>
              <div className="text-sm text-black/60 dark:text-white/60 mb-2">
                {diff.authorName} &lt;{diff.authorEmail}&gt; · {formatDate(diff.timestamp)}
              </div>
              <div className="font-mono text-xs text-black/60 dark:text-white/60 mb-2">{diff.sha}</div>
              <div className="flex gap-3 text-sm">
                <span><strong>{diff.stats.filesChanged}</strong> files changed</span>
                <span className="text-green-600 dark:text-green-400">+{diff.stats.insertions}</span>
                <span className="text-red-600 dark:text-red-400">-{diff.stats.deletions}</span>
              </div>
            </>
          )}
        </div>

        {/* Diff body */}
        <div className="overflow-auto p-4">
          {diff && (
            <pre className="text-xs font-mono leading-5">
              {lines.map((line, i) => (
                <div key={i} className={lineClass(line)}>
                  {line || "\u00a0"}
                </div>
              ))}
            </pre>
          )}
        </div>
      </div>
    </>
  );
};

export default DiffPage;
