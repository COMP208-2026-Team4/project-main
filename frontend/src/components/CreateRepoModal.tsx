import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { X } from "lucide-react";
import { selectUser } from "../store/auth";
import { getHeaders } from "../store/utils/rest-headers";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

interface Props {
  onClose: () => void;
}

/**
 * Modal form to create a new Git repository via the git-agent endpoint.
 */
const CreateRepoModal: React.FC<Props> = ({ onClose }) => {
  const user = useSelector(selectUser);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Repository name is required");
      return;
    }
    if (!/^[\w.-]+$/.test(name)) {
      setError("Name may only contain letters, numbers, dashes, dots, and underscores");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/repositories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getHeaders(),
        },
        body: JSON.stringify({ name: name.trim(), userId: user?.id }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Server error ${res.status}`);
      }

      onClose();
    } catch (err: any) {
      setError(err.message ?? "Failed to create repository");
    } finally {
      setLoading(false);
    }
  };

  // Close on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-black/10 dark:border-white/10 shadow-xl w-full max-w-md p-6 grid gap-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold dark:text-white">Create repository</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 hover:bg-black/8 dark:hover:bg-white/10 text-black/50 dark:text-white/50 cursor-pointer">
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-1">
            <label htmlFor="repo-name" className="text-sm font-medium dark:text-white">
              Repository name
            </label>
            <input
              id="repo-name"
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="my-awesome-project"
              className="w-full rounded-md border border-black/20 dark:border-white/20 bg-transparent
                         px-3 py-2 text-sm dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30
                         focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md border border-black/20 dark:border-white/20
                         text-sm dark:text-white hover:bg-black/4 dark:hover:bg-white/8 cursor-pointer">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-md bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50
                         text-white text-sm font-medium transition-colors cursor-pointer">
              {loading ? "Creating…" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRepoModal;
