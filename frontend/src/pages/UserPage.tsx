import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import {
  User as UserIcon,
  Lock,
  Server,
  Star,
  GitBranch,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import { actions as api } from "../store/api";
import { selectUser } from "../store/auth";
import { getHeaders } from "../store/utils/rest-headers";

interface PublicUser {
  id: string;
  username: string;
  avatarUrl?: string | null;
}

interface ProfileRepo {
  name: string;
  owner: string;
  visibility: string;
  description: string;
  star_count: number;
  created_at: string;
  updated_at: string;
  last_commit_timestamp: number | null;
}

const relativeTime = (epochSeconds: number) => {
  const diff = Math.floor(Date.now() / 1000) - epochSeconds;
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return `${Math.floor(diff / 2592000)}mo ago`;
};

const UserPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const dispatch = useDispatch() as any;
  const currentUser = useSelector(selectUser);
  const [profile, setProfile] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [repos, setRepos] = useState<ProfileRepo[]>([]);
  const [reposLoading, setReposLoading] = useState(true);

  const normalizedRouteUsername = useMemo(() => {
    if (!userId) return "";
    try {
      return decodeURIComponent(userId);
    } catch {
      return userId;
    }
  }, [userId]);

  useEffect(() => {
    if (!normalizedRouteUsername) {
      setLoading(false);
      setNotFound(true);
      setProfile(null);
      return;
    }

    if (
      currentUser?.username &&
      currentUser.username.toLowerCase() === normalizedRouteUsername.toLowerCase()
    ) {
      setProfile({
        id: String(currentUser.id),
        username: String(currentUser.username),
        avatarUrl: (currentUser.avatarUrl as string | undefined) ?? null,
      });
      setLoading(false);
      setNotFound(false);
    } else {
      setLoading(true);
      setNotFound(false);
      setProfile(null);

      dispatch(
        api.restCallBegan({
          url: `/users/${encodeURIComponent(normalizedRouteUsername)}`,
          method: "get",
          callback: (payload: any) => {
            setProfile({
              id: String(payload?.id ?? ""),
              username: String(payload?.username ?? normalizedRouteUsername),
              avatarUrl: (payload?.avatarUrl as string | undefined) ?? null,
            });
            setLoading(false);
            setNotFound(false);
          },
          errorCallback: (response: any) => {
            setLoading(false);
            setNotFound(response?.status === 404);
          },
        })
      );
    }

    // Fetch profile repos
    setReposLoading(true);
    dispatch(
      api.restCallBegan({
        url: `/repositories/profile/${encodeURIComponent(normalizedRouteUsername)}`,
        method: "get",
        headers: getHeaders(),
        callback: (data: any) => {
          setRepos(Array.isArray(data) ? data : []);
          setReposLoading(false);
        },
        errorCallback: () => {
          setRepos([]);
          setReposLoading(false);
        },
      })
    );
  }, [dispatch, normalizedRouteUsername, currentUser]);

  const username = profile?.username ?? normalizedRouteUsername;
  const avatarUrl = profile?.avatarUrl ?? null;
  const isOwner = currentUser?.username?.toLowerCase() === normalizedRouteUsername.toLowerCase();

  return (
    <>
      <Sidebar variant="user" />
      <div
        data-testid="public-profile-page"
        className="dark:bg-white/8 h-[calc(100vh_-_var(--spacing)_*_16)] overflow-auto p-8"
      >
        {loading ? (
          <div className="grid place-items-center h-full text-black/60 dark:text-white/60">
            Loading profile...
          </div>
        ) : notFound ? (
          <div className="grid place-items-center h-full">
            <div className="grid gap-2 place-items-center bg-white dark:bg-black border border-black/20 dark:border-white/20 rounded-2xl p-8 min-w-[20rem]">
              <div className="text-2xl font-bold">User not found</div>
              <div className="text-black/60 dark:text-white/60 text-sm">@{normalizedRouteUsername}</div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto grid gap-6">
            {/* Profile header */}
            <div className="flex items-center gap-4">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={`${username} avatar`}
                  className="size-20 rounded-full object-cover border border-black/10 dark:border-white/10"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <div className="size-20 rounded-full grid place-items-center bg-black/10 dark:bg-white/10">
                  <UserIcon className="size-8 text-black/60 dark:text-white/60" />
                </div>
              )}
              <div>
                <div data-testid="public-profile-username" className="text-2xl font-bold">
                  {username}
                </div>
                <div className="text-black/50 dark:text-white/50 text-sm">
                  {repos.length} {repos.length === 1 ? "repository" : "repositories"}
                </div>
              </div>
            </div>

            {/* Repositories */}
            <div>
              <h2 className="text-lg font-[500] mb-3">Repositories</h2>
              <div className="grid gap-2">
                {reposLoading ? (
                  <div className="rounded-lg border border-black/10 dark:border-white/10 p-4 text-sm text-black/40 dark:text-white/40">
                    Loading repositories...
                  </div>
                ) : repos.length === 0 ? (
                  <div className="rounded-lg border border-black/10 dark:border-white/10 p-4 text-sm text-black/40 dark:text-white/40">
                    No public repositories yet.
                  </div>
                ) : (
                  repos.map((r) => (
                    <Link
                      key={r.name}
                      to={`/${r.owner}/${r.name}/repo`}
                      className="rounded-lg border border-black/10 dark:border-white/10 p-4 grid grid-cols-[auto_1fr_auto] gap-3 items-center transition-colors hover:bg-black/4 dark:hover:bg-white/6 hover:border-black/20 dark:hover:border-white/20"
                    >
                      {/* Icon */}
                      <div className="text-black/40 dark:text-white/40">
                        {r.visibility === "private" ? (
                          <Lock className="size-4" />
                        ) : (
                          <Server className="size-4" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{r.name}</span>
                          {r.visibility === "private" && (
                            <span className="text-xs px-1.5 py-0.5 rounded-full border border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10">
                              Private
                            </span>
                          )}
                        </div>
                        {r.description && (
                          <div className="text-sm text-black/50 dark:text-white/50 truncate">
                            {r.description}
                          </div>
                        )}
                      </div>

                      {/* Meta */}
                      <div className="flex items-center gap-3 text-xs text-black/40 dark:text-white/40 shrink-0">
                        {r.star_count > 0 && (
                          <span className="flex items-center gap-1">
                            <Star className="size-3" />
                            {r.star_count}
                          </span>
                        )}
                        {r.last_commit_timestamp && (
                          <span>Updated {relativeTime(r.last_commit_timestamp)}</span>
                        )}
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default UserPage;
