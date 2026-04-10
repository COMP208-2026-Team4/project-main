import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { User as UserIcon } from "lucide-react";
import Sidebar from "../components/Sidebar";
import { actions as api } from "../store/api";
import { selectUser } from "../store/auth";

interface PublicUser {
  id: string;
  username: string;
  avatarUrl?: string | null;
}

const UserPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const dispatch = useDispatch();
  const currentUser = useSelector(selectUser);
  const [profile, setProfile] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

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
      return;
    }

    setLoading(true);
    setNotFound(false);
    setProfile(null);

    (dispatch as any)(
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
  }, [dispatch, normalizedRouteUsername, currentUser]);

  const username = profile?.username ?? normalizedRouteUsername;
  const avatarUrl = profile?.avatarUrl ?? null;

  return (
    <>
      <Sidebar variant="user" />
      <div
        data-testid="public-profile-page"
        className="dark:bg-white/8 h-[calc(100vh_-_var(--spacing)_*_16)] grid place-items-center p-8"
      >
        {loading ? (
          <div className="text-black/60 dark:text-white/60">Loading profile...</div>
        ) : notFound ? (
          <div className="grid gap-2 place-items-center bg-white dark:bg-black border border-black/20 dark:border-white/20 rounded-2xl p-8 min-w-[20rem]">
            <div className="text-2xl font-bold">User not found</div>
            <div className="text-black/60 dark:text-white/60 text-sm">@{normalizedRouteUsername}</div>
          </div>
        ) : (
          <div className="grid gap-4 place-items-center bg-white dark:bg-black border border-black/20 dark:border-white/20 rounded-2xl p-8 min-w-[20rem]">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={`${username} avatar`}
                className="size-24 rounded-full object-cover border border-black/10 dark:border-white/10"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div className="size-24 rounded-full grid place-items-center bg-black/10 dark:bg-white/10">
                <UserIcon className="size-10 text-black/60 dark:text-white/60" />
              </div>
            )}
            <div data-testid="public-profile-username" className="text-2xl font-bold">
              {username}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default UserPage;