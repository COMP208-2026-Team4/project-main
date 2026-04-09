import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import Sidebar from "../components/Sidebar";
import FileEditorModal from "../components/FileEditorModal";
import { fetchBlob, deleteBlob } from "../store/git";
import { selectUser } from "../store/auth";

const BlobPage: React.FC = () => {
  const { userId, repoId } = useParams<{ userId: string; repoId: string }>();
  const [searchParams] = useSearchParams();
  const ref = searchParams.get("ref") ?? "main";
  const path = searchParams.get("path") ?? "";
  const dispatch = useDispatch() as any;
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const blob = useSelector((s: Store.AppState) => s.entities.git.blob);
  const loading = useSelector((s: Store.AppState) => s.entities.git.loading);
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    if (userId && repoId && path)
      dispatch(fetchBlob(userId, repoId, ref, path));
  }, [userId, repoId, ref, path]);

  const decoded = useMemo(() => {
    if (!blob || blob.isBinary) return "";
    try {
      return decodeURIComponent(escape(atob(blob.content)));
    } catch {
      return "";
    }
  }, [blob]);

  const filename = path.split("/").pop() ?? "";
  const isMarkdown = /\.(md|markdown)$/i.test(filename);

  const segments = path.split("/").filter(Boolean);

  const onDelete = () => {
    if (!userId || !repoId) return;
    if (!window.confirm(`Delete ${path}?`)) return;
    dispatch(deleteBlob(userId, repoId, {
      path,
      message: `Delete ${path}`,
      branch: ref,
      author_name: user?.username ?? "anonymous",
      author_email: user?.email ?? "anonymous@local",
    }, () => navigate(`/${userId}/${repoId}/repo`)));
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
          {segments.map((seg, i) => (
            <span key={i} className="flex items-center gap-2">
              <span className="opacity-50">/</span>
              {i === segments.length - 1 ? (
                <span className="font-bold">{seg}</span>
              ) : (
                <span>{seg}</span>
              )}
            </span>
          ))}
        </div>

        {/* Toolbar */}
        <div className="h-12 px-4 flex items-center justify-between border-b border-black/20 dark:border-white/20">
          <div className="text-sm text-black/60 dark:text-white/60">
            {blob ? `${blob.size} B · ${ref}` : ""}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowEditor(true)}
              disabled={!blob || blob.isBinary}
              className="px-3 py-1 rounded-md bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              <Pencil className="size-4" /> Edit
            </button>
            <button
              onClick={onDelete}
              className="px-3 py-1 rounded-md bg-red-500/20 hover:bg-red-500/30 cursor-pointer flex items-center gap-2 text-red-700 dark:text-red-400"
            >
              <Trash2 className="size-4" /> Delete
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-auto p-4">
          {loading && !blob && <div className="text-black/60 dark:text-white/60">Loading...</div>}
          {blob?.isBinary && (
            <div className="text-black/60 dark:text-white/60">Binary file not shown.</div>
          )}
          {blob && !blob.isBinary && isMarkdown && (
            <div className="prose dark:prose-invert max-w-none">
              <ReactMarkdown>{decoded}</ReactMarkdown>
            </div>
          )}
          {blob && !blob.isBinary && !isMarkdown && (
            <pre className="p-4 rounded-lg bg-black/4 dark:bg-white/4 overflow-x-auto">
              <code className="font-mono text-sm whitespace-pre">{decoded}</code>
            </pre>
          )}
        </div>
      </div>

      {showEditor && userId && repoId && blob && (
        <FileEditorModal
          owner={userId}
          repo={repoId}
          branch={ref}
          mode="edit"
          initialPath={path}
          initialContent={decoded}
          onClose={() => setShowEditor(false)}
          onSaved={() => dispatch(fetchBlob(userId, repoId, ref, path))}
        />
      )}
    </>
  );
};

export default BlobPage;
