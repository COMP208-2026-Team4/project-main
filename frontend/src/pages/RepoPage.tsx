import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Star,
  GitBranch,
  ChevronDown,
  Copy,
  Folder,
  FileText,
  GitCommitHorizontal,
  Tag,
  Rocket,
  Scale,
  Plus,
  ArrowLeft,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import FileEditorModal from "../components/FileEditorModal";
import { fetchBranches, fetchCommits, fetchTree, fetchBlob, actions as gitActions } from "../store/git";
import { selectUser } from "../store/auth";

const SkeletonFileRow: React.FC<{ icon: React.ReactNode }> = ({ icon }) => (
  <tr className="bg-black/2 dark:bg-white/2 bg-clip-padding border-t border-white dark:border-black">
    <td className="h-12 pl-4 flex flex-auto-col place-items-center gap-4">
      {icon}
      <div className="h-2 bg-black/16 dark:bg-white/16 rounded-full w-32" />
    </td>
    <td className="h-12">
      <div className="h-2 bg-black/16 dark:bg-white/16 rounded-full w-64" />
    </td>
    <td className="h-12 pr-4">
      <div className="h-2 bg-black/16 dark:bg-white/16 rounded-full w-24 ml-auto" />
    </td>
  </tr>
);

const relativeTime = (epochSeconds: number) => {
  const diff = Math.floor(Date.now() / 1000) - epochSeconds;
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return `${Math.floor(diff / 2592000)}mo ago`;
};

const RepoPage: React.FC = () => {
  const { userId, repoId } = useParams<{ userId: string; repoId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch() as any;
  const git = useSelector((s: Store.AppState) => s.entities.git);
  const user = useSelector(selectUser);

  // Backwards-compatibility: if the URL still uses the legacy numeric `sub`
  // for the owner segment but the authenticated user owns it, redirect to
  // the canonical username URL so links/refresh stay consistent.
  useEffect(() => {
    if (!user || !userId || !repoId) return;
    if (userId === user.id && user.username && user.username !== userId) {
      navigate(`/${user.username}/${repoId}/repo`, { replace: true });
    }
  }, [user?.id, user?.username, userId, repoId]);

  // `selectedBranch` is null until we know the repo's real default branch.
  // This eliminates the cold-load race where we used to dispatch tree/commits
  // calls hard-coded to "main" before fetchBranches resolved.
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState("");
  const [showEditor, setShowEditor] = useState(false);

  // Step 1: when the route or user changes, reset the cached repo state and
  // kick off the branch lookup. We gate on `user` so direct-load (refresh)
  // doesn't fire requests before the auth hydration finishes - the JWT in
  // localStorage is still attached, but waiting for `user` keeps the
  // page's ownership-resolution logic deterministic.
  useEffect(() => {
    if (!userId || !repoId || !user) return;
    dispatch(gitActions.repoReset());
    setSelectedBranch(null);
    setCurrentPath("");
    dispatch(fetchBranches(userId, repoId));
  }, [userId, repoId, user?.id]);

  // Step 2: once branches arrive, choose the canonical branch (HEAD reported
  // by the backend, falling back to the first branch). This is what makes
  // direct-loaded repo pages succeed even when the default branch isn't
  // "main".
  useEffect(() => {
    if (selectedBranch !== null) return;
    if (git.head) {
      setSelectedBranch(git.head);
      return;
    }
    if (git.branches.length > 0) {
      setSelectedBranch(git.branches[0].name);
    }
  }, [git.head, git.branches, selectedBranch]);

  // Step 3: once we have a real branch, fetch tree + commits.
  useEffect(() => {
    if (!userId || !repoId || !user || !selectedBranch) return;
    dispatch(fetchTree(userId, repoId, selectedBranch, currentPath));
    dispatch(fetchCommits(userId, repoId, selectedBranch, 1));
  }, [userId, repoId, user?.id, selectedBranch, currentPath]);

  const refresh = () => {
    if (!userId || !repoId || !selectedBranch) return;
    dispatch(fetchBranches(userId, repoId));
    dispatch(fetchTree(userId, repoId, selectedBranch, currentPath));
    dispatch(fetchCommits(userId, repoId, selectedBranch, 1));
  };

  const lastCommit = git.commits[0];

  const readmeEntry = useMemo(
    () => git.tree.find((e) => /^readme\.(md|markdown)$/i.test(e.name)),
    [git.tree],
  );

  useEffect(() => {
    if (readmeEntry && userId && repoId && selectedBranch) {
      const fullPath = currentPath ? `${currentPath}/${readmeEntry.name}` : readmeEntry.name;
      dispatch(fetchBlob(userId, repoId, selectedBranch, fullPath));
    } else {
      dispatch(gitActions.blobFetched(null));
    }
  }, [readmeEntry?.sha, userId, repoId, selectedBranch]);

  const decodedReadme = useMemo(() => {
    if (!git.blob || git.blob.isBinary) return "";
    try {
      return decodeURIComponent(escape(atob(git.blob.content)));
    } catch {
      return "";
    }
  }, [git.blob]);

  const goUp = () => {
    const parts = currentPath.split("/").filter(Boolean);
    parts.pop();
    setCurrentPath(parts.join("/"));
  };

  return (
    <>
      <Sidebar variant="repo" />
      <div className="grid grid-cols-[1fr_auto] grid-rows-[auto_1fr] dark:bg-white/8 h-[calc(100vh_-_var(--spacing)_*_16)]">
        {/* Breadcrumb */}
        <div className="border-b border-black/20 dark:border-white/20 h-12 col-span-full grid grid-cols-[auto_1fr] place-items-center pl-4 pr-2">
          <div className="grid grid-flow-col gap-2">
            <Link className="grid grid-flow-col gap-2 place-items-center hover:underline" to={`/${userId}`}>
              {userId}
            </Link>
            <span className="opacity-50">/</span>
            <span className="font-bold">{repoId}</span>
          </div>
          <div className="grid grid-flow-col gap-[1px] place-self-end my-auto">
            <button className="py-1 px-3 rounded-l-lg bg-black/20 hover:bg-black/30 dark:bg-white/20 hover:dark:bg-white/30 cursor-pointer grid grid-flow-col place-items-center gap-2">
              <Star className="size-5" />
              <span className="font-bold">Star</span>
            </button>
            <button className="py-1 px-3 rounded-r-lg bg-black/20 hover:bg-black/30 dark:bg-white/20 hover:dark:bg-white/30 cursor-pointer grid grid-flow-col place-items-center gap-2">
              <span className="font-bold">{git.branches.length}</span>
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="h-full grid grid-rows-[auto_auto_auto_1fr] overflow-auto">
          {/* Branch bar */}
          <div className="h-12 grid grid-cols-[auto_auto_1fr_auto] place-items-center px-2 gap-2 bg-clip-padding border-b border-black/20 dark:border-white/20">
            <div className="relative grid place-items-center">
              <select
                value={selectedBranch ?? ""}
                onChange={(e) => { setSelectedBranch(e.target.value); setCurrentPath(""); }}
                className="appearance-none py-1 pl-8 pr-8 rounded-lg bg-black/10 hover:bg-black/20 dark:bg-white/10 hover:dark:bg-white/20 cursor-pointer font-mono"
              >
                {git.branches.map((b) => <option key={b.name} value={b.name}>{b.name}</option>)}
                {selectedBranch && !git.branches.find((b) => b.name === selectedBranch) && (
                  <option value={selectedBranch}>{selectedBranch}</option>
                )}
              </select>
              <GitBranch className="size-4 absolute left-2 pointer-events-none" />
              <ChevronDown className="size-4 absolute right-2 pointer-events-none" />
            </div>
            {currentPath && (
              <button
                onClick={goUp}
                className="py-1 px-2 rounded-lg bg-black/10 hover:bg-black/20 dark:bg-white/10 hover:dark:bg-white/20 cursor-pointer grid grid-flow-col place-items-center gap-2"
              >
                <ArrowLeft className="size-4" />
                <span className="text-sm font-mono">/{currentPath}</span>
              </button>
            )}
            <span />
            <button
              onClick={() => setShowEditor(true)}
              className="py-1 px-3 rounded-lg bg-green-400/70 hover:bg-green-400/90 cursor-pointer grid grid-flow-col place-items-center gap-2 text-black/80 my-auto font-bold"
            >
              <Plus className="size-4" />
              Add file
            </button>
          </div>

          {/* Last commit */}
          {lastCommit && (
            <div className="p-2 grid grid-cols-[1fr_auto_auto] gap-2 bg-clip-padding border-b border-black/20 dark:border-white/20">
              <div className="grid grid-flow-row pl-2">
                <div className="font-[700] truncate">{lastCommit.message.split("\n")[0]}</div>
                <div>
                  <span className="hover:underline">{lastCommit.authorName}</span>{" "}
                  <span className="text-black/50 dark:text-white/50">
                    committed {relativeTime(lastCommit.timestamp)}
                  </span>
                </div>
              </div>
              <div className="grid grid-flow-col my-auto">
                <div className="py-1 px-3 rounded-l-lg bg-black/10 dark:bg-white/10 grid grid-flow-col place-items-center gap-2 text-black/60 dark:text-white/60">
                  <span className="font-mono translate-y-px">{lastCommit.sha.slice(0, 8)}</span>
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(lastCommit.sha)}
                  className="py-1 px-2 rounded-r-lg bg-black/20 hover:bg-black/30 dark:bg-white/20 hover:dark:bg-white/30 cursor-pointer grid grid-flow-col place-items-center gap-2 text-black/60 dark:text-white/60"
                >
                  <Copy className="size-4" />
                </button>
              </div>
              <Link
                to={`/${userId}/${repoId}/repo/commits?branch=${selectedBranch ?? ""}`}
                className="py-1 px-2 rounded-lg bg-black/20 hover:bg-black/30 dark:bg-white/20 hover:dark:bg-white/30 cursor-pointer grid grid-flow-col place-items-center gap-2 my-auto h-8 mr-2 font-[500]"
              >
                History
              </Link>
            </div>
          )}

          {/* File table */}
          <table className="table-fixed bg-clip-padding border-b border-black/20 dark:border-white/20">
            <thead>
              <tr className="h-12 bg-black/8 dark:bg-white/8">
                <th className="w-[40%] text-left pl-4">Name</th>
                <th className="w-[40%] text-left">Type</th>
                <th className="w-[20%] text-right pr-4">Size</th>
              </tr>
            </thead>
            <tbody>
              {git.loading && git.tree.length === 0 && (
                <>
                  <SkeletonFileRow icon={<Folder className="size-4" />} />
                  <SkeletonFileRow icon={<Folder className="size-4" />} />
                  <SkeletonFileRow icon={<FileText className="size-4" />} />
                </>
              )}
              {git.tree.map((entry) => {
                const fullPath = currentPath ? `${currentPath}/${entry.name}` : entry.name;
                const isFolder = entry.type === "tree";
                return (
                  <tr key={entry.sha + entry.name} className="bg-black/2 dark:bg-white/2 bg-clip-padding border-t border-white dark:border-black hover:bg-black/4 dark:hover:bg-white/4">
                    <td className="h-12 pl-4">
                      <div className="flex items-center gap-3">
                        {isFolder
                          ? <Folder className="size-4 text-sky-600 dark:text-sky-400" />
                          : <FileText className="size-4 text-black/60 dark:text-white/60" />}
                        {isFolder ? (
                          <button
                            onClick={() => setCurrentPath(fullPath)}
                            className="hover:underline cursor-pointer"
                          >{entry.name}</button>
                        ) : (
                          <Link
                            to={`/${userId}/${repoId}/repo/blob?ref=${selectedBranch ?? ""}&path=${encodeURIComponent(fullPath)}`}
                            className="hover:underline"
                          >{entry.name}</Link>
                        )}
                      </div>
                    </td>
                    <td className="h-12 text-black/60 dark:text-white/60">{entry.type}</td>
                    <td className="h-12 pr-4 text-right text-black/60 dark:text-white/60">
                      {entry.size != null ? `${entry.size} B` : ""}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* README */}
          {readmeEntry && decodedReadme && (
            <div>
              <div className="h-12 bg-black/8 dark:bg-white/8 font-[500] grid grid-cols-[auto_auto_1fr] place-items-center bg-clip-padding border-b border-black/20 dark:border-white/20">
                <FileText className="size-5 inline mx-4" />
                {readmeEntry.name}
              </div>
              <div className="p-8">
                <pre className="whitespace-pre-wrap break-words text-sm leading-6">{decodedReadme}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="border-l border-black/20 dark:border-white/20 h-full w-80 p-4 flex flex-col gap-2">
          <div>
            <h4 className="font-bold">Project information</h4>
            A modern, open-source git productivity suite.
          </div>
          <hr className="border-black/20 dark:border-white/20 rounded-full my-1" />
          <Link
            to={`/${userId}/${repoId}/repo/commits?branch=${selectedBranch ?? ""}`}
            className="hover:underline grid grid-cols-[auto_auto_auto_1fr] gap-2 place-items-center"
          >
            <GitCommitHorizontal className="size-5 inline" />
            <span className="font-bold">{git.commits.length}</span> Commits
          </Link>
          <a className="hover:underline grid grid-cols-[auto_auto_auto_1fr] gap-2 place-items-center">
            <GitBranch className="size-5 inline" />
            <span className="font-bold">{git.branches.length}</span> Branches
          </a>
          <a className="hover:underline grid grid-cols-[auto_auto_auto_1fr] gap-2 place-items-center">
            <Tag className="size-5 inline" />
            <span className="font-bold">0</span> Tags
          </a>
          <a className="hover:underline grid grid-cols-[auto_auto_auto_1fr] gap-2 place-items-center">
            <Rocket className="size-5 inline" />
            <span className="font-bold">0</span> Releases
          </a>
          <hr className="border-black/20 dark:border-white/20 rounded-full my-1" />
          <h4 className="font-bold">Pinned</h4>
          {readmeEntry && (
            <Link
              to={`/${userId}/${repoId}/repo/blob?ref=${selectedBranch ?? ""}&path=${encodeURIComponent(readmeEntry.name)}`}
              className="hover:underline grid grid-cols-[auto_auto_auto_1fr] gap-2 place-items-center"
            >
              <FileText className="size-5 inline" />
              {readmeEntry.name}
            </Link>
          )}
          <a className="hover:underline grid grid-cols-[auto_auto_auto_1fr] gap-2 place-items-center">
            <Scale className="size-5 inline" />
            License
          </a>
        </div>
      </div>

      {showEditor && userId && repoId && selectedBranch && (
        <FileEditorModal
          owner={userId}
          repo={repoId}
          branch={selectedBranch}
          mode="create"
          onClose={() => setShowEditor(false)}
          onSaved={refresh}
        />
      )}
    </>
  );
};

export default RepoPage;
