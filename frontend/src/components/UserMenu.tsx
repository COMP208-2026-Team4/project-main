import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import {
  Smile,
  User as UserIcon,
  Settings,
  LogOut,
} from "lucide-react";
import { selectUser, logout } from "../store/auth";

interface UserMenuProps {
  isOpen: boolean;
  onClose: () => void;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
}

const UserMenu: React.FC<UserMenuProps> = ({ isOpen, onClose, buttonRef }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("click", handleClick);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, buttonRef]);

  if (!isOpen) return null;

  const username = (user?.username as string | undefined) ?? "Guest";
  const email = (user?.email as string | undefined) ?? null;
  const avatarUrl = (user?.avatarUrl as string | undefined) ?? null;
  const profilePath = user?.username ? `/${encodeURIComponent(user.username as string)}` : "/login";

  const handleSignOut = () => {
    dispatch(logout());
    onClose();
    navigate("/login", { replace: true });
  };

  return (
    <div
      ref={menuRef}
      data-testid="user-menu"
      className="absolute rounded-xl bg-clip-padding border border-black/20 dark:border-white/20 bg-white dark:bg-black right-2 top-16 p-2 grid shadow-md/10 dark:shadow-md/60 z-50 min-w-64">
      <div className="grid grid-cols-[auto_1fr] gap-3 items-center p-2">
        {avatarUrl ? (
          <img
            className="size-10 rounded-md object-cover"
            src={avatarUrl}
            alt={`${username} avatar`}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="size-10 rounded-md grid place-items-center bg-black/10 dark:bg-white/10">
            <UserIcon className="size-5 text-black/60 dark:text-white/60" />
          </div>
        )}
        <div className="min-w-0">
          <div className="font-bold leading-5 truncate">{username}</div>
          {email ? (
            <div className="font-normal text-black/50 dark:text-white/50 text-sm/5 truncate">
              {email}
            </div>
          ) : (
            <div className="font-normal text-black/40 dark:text-white/40 text-sm/5 italic">
              No email on file
            </div>
          )}
        </div>
      </div>
      <hr className="border-black/20 dark:border-white/20 rounded-full m-1" />
      <Link
        to={profilePath}
        onClick={onClose}
        className="grid grid-cols-[auto_1fr] gap-2 items-center rounded-lg hover:bg-black/8 hover:dark:bg-white/10 p-1 cursor-pointer"
      >
        <UserIcon className="mx-auto size-5" />
        <div>Profile</div>
      </Link>
      <a className="grid grid-cols-[auto_1fr] gap-2 items-center rounded-lg hover:bg-black/8 hover:dark:bg-white/10 p-1 cursor-pointer">
        <Smile className="mx-auto size-5" />
        <div>Set Status</div>
      </a>
      <a className="grid grid-cols-[auto_1fr] gap-2 items-center rounded-lg hover:bg-black/8 hover:dark:bg-white/10 p-1 cursor-pointer">
        <Settings className="mx-auto size-5" />
        <div>Preferences</div>
      </a>
      <hr className="border-black/20 dark:border-white/20 rounded-full m-1" />
      <button
        type="button"
        onClick={handleSignOut}
        className="grid grid-cols-[auto_1fr] gap-2 items-center rounded-lg hover:bg-black/8 hover:dark:bg-white/10 p-1 cursor-pointer text-left w-full"
      >
        <LogOut className="mx-auto size-5" />
        <div>Sign out</div>
      </button>
    </div>
  );
};

export default UserMenu;
