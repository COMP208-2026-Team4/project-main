import { useEffect, useRef } from "react";
import {
  Users,
  Smile,
  User,
  Settings,
  LogOut,
} from "lucide-react";

interface UserMenuProps {
  isOpen: boolean;
  onClose: () => void;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
}

const UserMenu: React.FC<UserMenuProps> = ({ isOpen, onClose, buttonRef }) => {
  const menuRef = useRef<HTMLDivElement>(null);

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

  return (
    <div
      ref={menuRef}
      className="absolute rounded-xl bg-clip-padding border border-black/20 dark:border-white/20 bg-white dark:bg-black right-2 top-16 p-2 grid shadow-md/10 dark:shadow-md/60 z-50">
      <div className="grid grid-cols-[auto_auto_1fr] gap-2 items-center p-1 w-56">
        <img className="size-8 rounded-md" src="/assets/jsmith.png" alt="User avatar" />
        <div>
          <div className="font-bold leading-5">John Smith</div>
          <div className="font-normal text-black/50 dark:text-white/50 text-sm/5">
            (jsmith)
          </div>
        </div>
        <a className="ml-auto p-2 rounded-lg hover:bg-black/8 hover:dark:bg-white/10 cursor-pointer">
          <Users className="size-5" />
        </a>
      </div>
      <hr className="border-black/20 dark:border-white/20 rounded-full m-1" />
      <a className="grid grid-cols-[auto_1fr] gap-2 items-center rounded-lg hover:bg-black/8 hover:dark:bg-white/10 p-1 cursor-pointer">
        <Smile className="mx-auto size-5" />
        <div>Set Status</div>
      </a>
      <a className="grid grid-cols-[auto_1fr] gap-2 items-center rounded-lg hover:bg-black/8 hover:dark:bg-white/10 p-1 cursor-pointer">
        <User className="mx-auto size-5" />
        <div>Edit Profile</div>
      </a>
      <a className="grid grid-cols-[auto_1fr] gap-2 items-center rounded-lg hover:bg-black/8 hover:dark:bg-white/10 p-1 cursor-pointer">
        <Settings className="mx-auto size-5" />
        <div>Preferences</div>
      </a>
      <hr className="border-black/20 dark:border-white/20 rounded-full m-1" />
      <a className="grid grid-cols-[auto_1fr] gap-2 items-center rounded-lg hover:bg-black/8 hover:dark:bg-white/10 p-1 cursor-pointer">
        <LogOut className="mx-auto size-5" />
        <div>Sign out</div>
      </a>
    </div>
  );
};

export default UserMenu;
