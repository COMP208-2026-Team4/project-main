import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Star,
  GitBranch,
  Copy,
  Folder,
  FileText,
  FileQuestion,
  GitCommitHorizontal,
  Tag,
  Rocket,
  Scale,
  Plus,
  ArrowLeft,
  Settings,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import FileEditorModal from "../components/FileEditorModal";
import BranchDropdown from "../components/BranchDropdown";
import RepoSettings from "../components/RepoSettings";
import { selectUser } from "../store/auth";
import { fetchBranches, fetchCommits, fetchTree, fetchBlob, fetchMeta, starRepo, unstarRepo, actions as gitActions } from "../store/git";
import { renderMarkdown, findReadme, findLicense } from "../lib/markdown";

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
  const dispatch = useDispatch() as any;
  const git = useSelector((s: Store.AppState) => s.entities.git);
  const user = useSelector(selectUser);

  const [selectedBranch, setSelectedBranch] = useState("main");
  const [currentPath, setCurrentPath] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const isOwner = user?.username?.toLowerCase() === userId?.toLowerCase()
    || user?.id === userId;

  const refresh = () => {
    if (!userId || !repoId) return;
    dispatch(fetchBranches(userId, repoId));
    dispatch(fetchTree(userId, repoId, selectedBranch, currentPath));
    dispatch(fetchCommits(userId, repoId, selectedBranch, 1));
    dispatch(fetchMeta(userId, repoId));
  };

  useEffect(() => {
    refresh();
  }, [userId, repoId, selectedBranch, currentPath]);

  const lastCommit = git.commits[0];

  const readmeEntry = useMemo(() => findReadme(git.tree), [git.tree]);
  const licenseEntry = useMemo(() => findLicense(git.tree), [git.tree]);
  const sortedTree = useMemo(
    () => [...git.tree].sort((a, b) => {
      const aIsFolder = a.type === "tree";
      const bIsFolder = b.type === "tree";

      if (aIsFolder !== bIsFolder) return aIsFolder ? -1 : 1;

      return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
    }),
    [git.tree],
  );

  useEffect(() => {
    if (readmeEntry && userId && repoId) {
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

  const renderedReadme = useMemo(
    () => (decodedReadme ? renderMarkdown(decodedReadme) : ""),
    [decodedReadme],
  );

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
            {git.meta ? (
              (() => {
                const isPublic = git.meta.visibility?.toLowerCase() === "public";
                return (
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                      isPublic
                        ? "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700"
                        : "bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-600"
                    }`}
                    aria-label={`Repository visibility: ${isPublic ? "public" : "private"}`}
                    title={`This repository is ${isPublic ? "public" : "private"}`}
                  >
                    {isPublic ? "Public" : "Private"}
                  </span>
                );
              })()
            ) : (
              <span className="text-xs opacity-40 italic">Visibility unknown</span>
            )}
          </div>
          <div className="grid grid-flow-col gap-2 place-self-end my-auto">
            {isOwner && (
              <button
                onClick={() => setShowSettings(true)}
                className="py-1 px-3 rounded-lg bg-black/20 hover:bg-black/30 dark:bg-white/20 hover:dark:bg-white/30 cursor-pointer grid grid-flow-col place-items-center gap-2"
                aria-label="Repository settings"
              >
                <Settings className="size-4" />
              </button>
            )}
            <div className="grid grid-flow-col gap-[1px]">
              <button
                onClick={() => {
                  if (!userId || !repoId || !user) return;
                  if (git.meta?.starredByMe) {
                    dispatch(unstarRepo(userId, repoId));
                  } else {
                    dispatch(starRepo(userId, repoId));
                  }
                }}
                className={`py-1 px-3 rounded-l-lg cursor-pointer grid grid-flow-col place-items-center gap-2 ${
                  git.meta?.starredByMe
                    ? "bg-amber-500/20 hover:bg-amber-500/30 text-amber-700 dark:text-amber-400"
                    : "bg-black/20 hover:bg-black/30 dark:bg-white/20 hover:dark:bg-white/30"
                }`}
              >
                <Star className={`size-5 ${git.meta?.starredByMe ? "fill-current" : ""}`} />
                <span className="font-bold">Star</span>
              </button>
              <button className="py-1 px-3 rounded-r-lg bg-black/20 hover:bg-black/30 dark:bg-white/20 hover:dark:bg-white/30 cursor-pointer grid grid-flow-col place-items-center gap-2">
                <span className="font-bold">{git.meta?.starCount ?? 0}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="h-full grid grid-rows-[auto_auto_auto_1fr] overflow-auto">
          {/* Branch bar */}
          <div className="h-12 grid grid-cols-[auto_auto_1fr_auto] place-items-center px-2 gap-2 bg-clip-padding border-b border-black/20 dark:border-white/20">
            <BranchDropdown
              branches={git.branches.map((b) => b.name)}
              selected={selectedBranch}
              onChange={(b) => { setSelectedBranch(b); setCurrentPath(""); }}
            />
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
              className="col-start-4 py-1 px-3 rounded-lg bg-green-400/70 hover:bg-green-400/90 cursor-pointer grid grid-flow-col place-items-center gap-2 text-black/80 my-auto font-bold"
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
                to={`/${userId}/${repoId}/repo/commits?branch=${selectedBranch}`}
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
              {!git.loading && git.tree.length === 0 && (
                <tr>
                  <td colSpan={3} className="h-32">
                    <div
                      data-testid="empty-repo-message"
                      className="grid place-items-center text-black/50 dark:text-white/50 gap-2 py-6"
                    >
                      <FileQuestion className="size-8" />
                      <div className="font-semibold">No files yet</div>
                      <div className="text-sm">
                        This repository is empty. Use <span className="font-mono">Add file</span> to create the first file.
                      </div>
                    </div>
                  </td>
                </tr>
              )}
              {sortedTree.map((entry) => {
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
                            to={`/${userId}/${repoId}/repo/blob?ref=${selectedBranch}&path=${encodeURIComponent(fullPath)}`}
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
          {readmeEntry && renderedReadme && (
            <div>
              <div className="h-12 bg-black/8 dark:bg-white/8 font-[500] grid grid-cols-[auto_auto_1fr] place-items-center bg-clip-padding border-b border-black/20 dark:border-white/20">
                <FileText className="size-5 inline mx-4" />
                {readmeEntry.name}
              </div>
              <div
                data-testid="readme-rendered"
                className="markdown-body p-8"
                dangerouslySetInnerHTML={{ __html: renderedReadme }}
              />
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="border-l border-black/20 dark:border-white/20 h-full w-80 p-4 flex flex-col gap-2">
          <div>
            <h4 className="font-bold">Project information</h4>
            {git.meta?.description
              ? <p className="text-sm mt-1">{git.meta.description}</p>
              : <p className="text-sm mt-1 text-black/40 dark:text-white/40 italic">No description provided.</p>
            }
          </div>
          <hr className="border-black/20 dark:border-white/20 rounded-full my-1" />
          <Link
            to={`/${userId}/${repoId}/repo/commits?branch=${selectedBranch}`}
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
              to={`/${userId}/${repoId}/repo/blob?ref=${selectedBranch}&path=${encodeURIComponent(readmeEntry.name)}`}
              className="hover:underline grid grid-cols-[auto_auto_auto_1fr] gap-2 place-items-center"
            >
              <FileText className="size-5 inline" />
              {readmeEntry.name}
            </Link>
          )}
          {licenseEntry && (
            <Link
              data-testid="pinned-license"
              to={`/${userId}/${repoId}/repo/blob?ref=${selectedBranch}&path=${encodeURIComponent(licenseEntry.name)}`}
              className="hover:underline grid grid-cols-[auto_auto_auto_1fr] gap-2 place-items-center"
            >
              <Scale className="size-5 inline" />
              {licenseEntry.name}
            </Link>
          )}
        </div>
      </div>

      {showEditor && userId && repoId && (
        <FileEditorModal
          owner={userId}
          repo={repoId}
          branch={selectedBranch}
          mode="create"
          onClose={() => setShowEditor(false)}
          onSaved={refresh}
        />
      )}

      {showSettings && userId && repoId && git.meta && (
        <RepoSettings
          owner={userId}
          repo={repoId}
          meta={git.meta}
          onClose={() => setShowSettings(false)}
        />
      )}
    </>
  );
};

export default RepoPage;
