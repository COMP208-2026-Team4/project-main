import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X } from "lucide-react";
import { createBlob, updateBlob } from "../store/git";
import { selectUser } from "../store/auth";

interface FileEditorModalProps {
  owner: string;
  repo: string;
  branch: string;
  mode: "create" | "edit";
  initialPath?: string;
  initialContent?: string;
  onClose: () => void;
  onSaved: () => void;
}

const FileEditorModal: React.FC<FileEditorModalProps> = ({
  owner,
  repo,
  branch,
  mode,
  initialPath = "",
  initialContent = "",
  onClose,
  onSaved,
}) => {
  const dispatch = useDispatch() as any;
  const user = useSelector(selectUser);
  const [path, setPath] = useState(initialPath);
  const [content, setContent] = useState(initialContent);
  const [message, setMessage] = useState(
    mode === "create" ? `Add ${initialPath || "file"}` : `Update ${initialPath}`,
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = () => {
    if (!path.trim() || !message.trim()) {
      setError("Path and commit message are required.");
      return;
    }
    setSaving(true);
    setError(null);

    const payload = {
      path,
      content: btoa(unescape(encodeURIComponent(content))),
      message,
      branch,
      author_name: user?.username ?? "anonymous",
      author_email: user?.email ?? "anonymous@local",
    };

    const onOk = () => {
      setSaving(false);
      onSaved();
      onClose();
    };
    const onErr = (resp: any) => {
      setSaving(false);
      setError(resp?.data?.error ?? "Failed to save file.");
    };

    if (mode === "create")
      dispatch(createBlob(owner, repo, payload, onOk, onErr));
    else
      dispatch(updateBlob(owner, repo, payload, onOk, onErr));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 grid place-items-center p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-lg w-full max-w-4xl max-h-[90vh] grid grid-rows-[auto_1fr_auto] overflow-hidden border border-black/20 dark:border-white/20">
        <div className="flex items-center justify-between px-4 h-12 border-b border-black/20 dark:border-white/20">
          <h2 className="font-bold">{mode === "create" ? "New file" : "Edit file"}</h2>
          <button onClick={onClose} className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded cursor-pointer">
            <X className="size-5" />
          </button>
        </div>
        <div className="overflow-auto p-4 grid gap-3">
          <label className="grid gap-1">
            <span className="text-sm font-[500]">Path</span>
            <input
              type="text"
              value={path}
              readOnly={mode === "edit"}
              onChange={(e) => setPath(e.target.value)}
              placeholder="e.g. src/lib.rs"
              className="px-3 py-2 rounded-md bg-black/5 dark:bg-white/5 font-mono text-sm border border-black/10 dark:border-white/10"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-[500]">Content</span>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={18}
              className="px-3 py-2 rounded-md bg-black/5 dark:bg-white/5 font-mono text-sm border border-black/10 dark:border-white/10 resize-y"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-[500]">Commit message</span>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="px-3 py-2 rounded-md bg-black/5 dark:bg-white/5 text-sm border border-black/10 dark:border-white/10"
            />
          </label>
          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>
          )}
        </div>
        <div className="flex justify-end gap-2 px-4 h-14 items-center border-t border-black/20 dark:border-white/20">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="px-4 py-1.5 rounded-md bg-green-500 hover:bg-green-600 text-black font-bold cursor-pointer disabled:opacity-50"
          >
            {saving ? "Saving..." : "Commit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileEditorModal;
