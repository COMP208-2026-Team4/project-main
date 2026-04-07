import { useRef, useState } from "react";
import {
  Search,
  Plus,
  ChevronDown,
  Tickets,
  BookMarked,
  BookOpen,
  Inbox,
} from "lucide-react";
import Logo from "./Logo";
import UserMenu from "./UserMenu";

const Navbar: React.FC = () => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuBtnRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <div className="bg-black/6 dark:bg-black col-span-full grid grid-cols-[1fr_1fr_1fr] h-16 place-items-center bg-clip-padding border-b border-black/20 dark:border-white/20">
        {/* Left */}
        <Logo />
        {/* Center */}
        <button className="p-2 rounded-md bg-clip-padding border border-black/20 dark:border-white/20 text-black/60 hover:bg-black/8 hover:dark:bg-white/10 dark:text-white/60 w-full grid grid-cols-[auto_1fr_auto] items-center cursor-pointer">
          <div className="size-5" />
          <div className="leading-5">
            Type{" "}
            <kbd className="inline-block rounded-md bg-clip-padding border border-black/20 dark:border-white/20 w-5 font-mono">
              <span className="inline-block translate-y-px">/</span>
            </kbd>{" "}
            to search
          </div>
          <Search className="text-black/60 dark:text-white/60 size-5" />
        </button>
        {/* Right */}
        <div className="grid grid-flow-col gap-2 place-items-center h-full place-self-end pr-3">
          <button className="p-2 rounded-md bg-clip-padding border border-black/20 dark:border-white/20 hover:bg-black/8 hover:dark:bg-white/10 text-white/40 grid grid-flow-col cursor-pointer">
            <Plus className="text-black/60 dark:text-white/60 size-5 mr-1" />
            <ChevronDown className="text-black/60 dark:text-white/60 size-4 my-auto" />
          </button>
          <button className="p-2 rounded-md bg-clip-padding border border-black/20 dark:border-white/20 hover:bg-black/8 hover:dark:bg-white/10 text-white/40 cursor-pointer">
            <Tickets className="text-black/60 dark:text-white/60 size-5" />
          </button>
          <button className="p-2 rounded-md bg-clip-padding border border-black/20 dark:border-white/20 hover:bg-black/8 hover:dark:bg-white/10 text-white/40 cursor-pointer">
            <BookMarked className="text-black/60 dark:text-white/60 size-5" />
          </button>
          <a
            href="https://docs-pi-lovat.vercel.app/"
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-md bg-clip-padding border border-black/20 dark:border-white/20 hover:bg-black/8 hover:dark:bg-white/10 text-white/40 cursor-pointer">
            <BookOpen className="text-black/60 dark:text-white/60 size-5" />
          </a>
          <button className="relative p-2 rounded-md bg-clip-padding border border-black/20 dark:border-white/20 hover:bg-black/8 hover:dark:bg-white/10 text-white/40 cursor-pointer">
            <Inbox className="text-black/60 dark:text-white/60 size-5" />
            <div className="absolute bg-cyan-600 size-2 rounded-full top-1 right-1" />
          </button>
          <button
            ref={userMenuBtnRef}
            className="grid items-center rounded-md overflow-clip w-full cursor-pointer"
            onClick={() => setUserMenuOpen((prev) => !prev)}>
            <img className="h-10" src="/assets/jsmith.png" alt="User avatar" />
          </button>
        </div>
      </div>
      <UserMenu
        isOpen={userMenuOpen}
        onClose={() => setUserMenuOpen(false)}
        buttonRef={userMenuBtnRef}
      />
    </>
  );
};

export default Navbar;
