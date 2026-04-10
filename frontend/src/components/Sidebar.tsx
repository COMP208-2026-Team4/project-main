import React from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useSidebar } from "../context/SidebarContext";
import {
  Tickets,
  PanelsTopLeft,
  BookMarked,
  Timer,
  ArrowLeftToLine,
  Code,
  CircleDot,
  GitPullRequest,
} from "lucide-react";

interface SidebarLink {
  to: string;
  icon: React.ReactNode;
  label: string;
}

interface SidebarProps { variant?: "home" | "kanban" | "repo" | "tickets" | "timer" | "docs" | "user"; }
interface CollapsibleProps { collapsed: boolean; }

const navClasses = (collapsed: boolean, extra = "") =>
  `gap-2 rounded-lg hover:bg-black/8 hover:dark:bg-white/10 py-1 px-2 w-full flex items-center ${
    (collapsed) ? "" : ""
  } ${extra}`.trim();

const labelClasses = (collapsed: boolean) =>
  `whitespace-nowrap overflow-hidden transition-[opacity,max-width] duration-300 ${
    (collapsed) ? "opacity-0 max-w-0" : "opacity-100 max-w-xs"
  }`;

// added unicode thin spaces for spacing
const HomeSidebar: React.FC<CollapsibleProps> = ({ collapsed }) => {
  const location = useLocation();
  const { userId, repoId } = useParams<{ userId: string; repoId: string }>();
  const basePath = userId && repoId ? `/${userId}/${repoId}` : "#";

  const links: SidebarLink[] = [];

  return (
    <div>
      {links.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          title={collapsed ? link.label : undefined}
          className={navClasses(collapsed, location.pathname === link.to ? "bg-black/8 dark:bg-white/10" : "")}
        >
          {link.icon}
          <span className={labelClasses(collapsed)}>{link.label}</span>
        </Link>
      ))}
    </div>
  );
};

const ProjectSidebar: React.FC<{ activePage: string } & CollapsibleProps> = ({ activePage, collapsed }) => {
  const { userId, repoId } = useParams<{ userId: string; repoId: string }>();
  const basePath = userId && repoId ? `/${userId}/${repoId}` : "#";

  return (
    <div>
      {(activePage === "kanban" || activePage === "repo") && (
        <>
          <Link
            to={`${basePath}/repo`}
            title={collapsed ? "cone" : undefined}
            className={navClasses(collapsed, "mb-2")}
          >
            <div className="block items-center rounded-sm overflow-clip bg-clip-padding border border-lime-600/30 dark:border-lime-800/30 bg-lime-600/20 dark:bg-lime-800/20 size-5 grid place-items-center shrink-0 mr-2">
              <div className="text-xs text-lime-600 dark:text-lime-700 -translate-y-px">{userId?.charAt(0).toUpperCase()}</div>
            </div>
            <span className={labelClasses(collapsed)}>{userId}</span>
          </Link>
          <Link
            to={`${basePath}/repo`}
            title={collapsed ? "Code" : undefined}
            className={navClasses(collapsed, activePage === "repo" ? "bg-black/8 dark:bg-white/10 hover:bg-black/4 hover:dark:bg-white/6" : "")}
          >
            <Code className="size-5 text-black/60 dark:text-white/60 shrink-0" />
            <span className={labelClasses(collapsed)}>Code</span>
          </Link>
        </>
      )}
    </div>
  );
};

const TimerSidebar: React.FC<CollapsibleProps> = ({ collapsed }) => {
  const { userId, repoId } = useParams<{ userId: string; repoId: string }>();
  const basePath = userId && repoId ? `/${userId}/${repoId}` : "#";

  return (
    <div>
      <Link
        to={userId ? `/${userId}` : "#"}
        title={collapsed ? userId : undefined}
        className={navClasses(collapsed, "mb-2")}
      >
        <img className="size-5 min-w-5 rounded-sm shrink-0" src={userId ? `/assets/${userId}.png` : "/assets/jsmith.png"} alt={userId ?? "user"} />
        <span className={labelClasses(collapsed)}>		{userId ?? "User"}</span>
      </Link>
      <Link
        to={`${basePath}/timer`}
        title={collapsed ? "Productivity" : undefined}
        className={navClasses(collapsed, "bg-black/8 dark:bg-white/10 hover:bg-black/4 hover:dark:bg-white/6")}
      >
        <Timer className="size-5 text-black/60 dark:text-white/60 shrink-0" />
        <span className={labelClasses(collapsed)}>		Productivity</span>
      </Link>
      <Link
        to={`${basePath}/repo`}
        title={collapsed ? "Repositories" : undefined}
        className={navClasses(collapsed)}>
        <BookMarked className="size-5 text-black/60 dark:text-white/60 shrink-0" />
        <span className={labelClasses(collapsed)}>  Repositiories</span>
      </Link>
      <Link
        to={`${basePath}/kanban`}
        title={collapsed ? "Projects" : undefined}
        className={navClasses(collapsed)}
      >
        <PanelsTopLeft className="size-5 text-black/60 dark:text-white/60 shrink-0" />
        <span className={labelClasses(collapsed)}>  Projects</span>
      </Link>
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ variant = "home" }) => {
  const { collapsed, setCollapsed } = useSidebar();

  const renderContent = () => {
    switch (variant) {
      case "home": return <HomeSidebar collapsed={collapsed} />;
      case "kanban": return <ProjectSidebar activePage="kanban" collapsed={collapsed} />;
      case "repo": return <ProjectSidebar activePage="repo" collapsed={collapsed} />;
      case "tickets": return <ProjectSidebar activePage="tickets" collapsed={collapsed} />;
      case "timer": return <TimerSidebar collapsed={collapsed} />;
      default: return <HomeSidebar collapsed={collapsed} />;
    }
  };

  return (
    <div
      className={`bg-black/6 dark:bg-black h-full p-4 bg-clip-padding border-r border-black/20 dark:border-white/20 grid grid-rows-[auto_1fr_auto] overflow-hidden transition-[width] duration-300 ease-in-out ${
        collapsed ? "w-[4.25rem]" : "w-64"
      }`}
    >
      {renderContent()}
      <div />
      <div>
        <button
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={navClasses(collapsed)}>
          <ArrowLeftToLine
            className={`cursor-pointer size-5 text-black/60 dark:text-white/60 shrink-0 transition-transform duration-300 ${
              collapsed ? "rotate-180" : "rotate-0"
            }`}
          />
          <span className={labelClasses(collapsed)}>  Collapse sidebar</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
