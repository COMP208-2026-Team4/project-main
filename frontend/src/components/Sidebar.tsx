import { Link, useLocation } from "react-router-dom";
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
  `rounded-lg hover:bg-black/8 hover:dark:bg-white/10 py-1 px-2 w-full flex items-center ${
    (collapsed) ? "" : ""
  } ${extra}`.trim();

const labelClasses = (collapsed: boolean) =>
  `whitespace-nowrap overflow-hidden transition-[opacity,max-width] duration-300 ${
    (collapsed) ? "opacity-0 max-w-0" : "opacity-100 max-w-xs"
  }`;

// added unicode thin spaces for spacing
const HomeSidebar: React.FC<CollapsibleProps> = ({ collapsed }) => {
  const location = useLocation();

  const links: SidebarLink[] = [
    { to: "/jsmith/1234/tickets", icon: <Tickets className="size-5 text-black/60 dark:text-white/60" />, label: "  Ticket list view" },
    { to: "/jsmith/1234/kanban", icon: <PanelsTopLeft className="size-5 text-black/60 dark:text-white/60" />, label: "  Kanban view" },
    { to: "/jsmith/1234/repo", icon: <BookMarked className="size-5 text-black/60 dark:text-white/60" />, label: "  Repository view" },
    { to: "/jsmith/1234/timer", icon: <Timer className="size-5 text-black/60 dark:text-white/60" />, label: "  Productivity view" },
  ];

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

  return (
    <div>
      <Link
        to="/jsmith"
        title={collapsed ? "ACME Corp." : undefined}
        className={navClasses(collapsed, "mb-2")}>
        <img className="size-5 min-w-5 rounded-sm shrink-0" src="/assets/acme.co.png" alt="ACME Corp." />
        <span className={labelClasses(collapsed)}>  ACME Corp.</span>
      </Link>
      <Link
        to="/jsmith/1234/tickets"
        title={collapsed ? "Tickets" : undefined}
        className={navClasses(collapsed, activePage === "tickets" ? "bg-black/8 dark:bg-white/10 hover:bg-black/4 hover:dark:bg-white/6" : "")}>
        <Tickets className="size-5 text-black/60 dark:text-white/60 shrink-0" />
        <span className={labelClasses(collapsed)}>  Tickets</span>
      </Link>
      <Link
        to="/jsmith/1234/kanban"
        title={collapsed ? "Projects" : undefined}
        className={navClasses(collapsed)}>
        <PanelsTopLeft className="size-5 text-black/60 dark:text-white/60 shrink-0" />
        <span className={labelClasses(collapsed)}>  Projects</span>
      </Link>
      <Link
        to="/jsmith/1234/repo"
        title={collapsed ? "Wiki" : undefined}
        className={navClasses(collapsed)}>
        <BookMarked className="size-5 text-black/60 dark:text-white/60 shrink-0" />
        <span className={labelClasses(collapsed)}>  Wiki</span>
      </Link>
      <hr className={`border-black/20 dark:border-white/20 rounded-full m-4 w-full transition-opacity duration-300 ${
        collapsed ? "opacity-0" : "opacity-100"
      }`} />
      {(activePage === "kanban" || activePage === "repo") && (
        <>
          <Link
            to="/jsmith/1234/repo"
            title={collapsed ? "cone" : undefined}
            className={navClasses(collapsed, "mb-2")}>
            <div className="block items-center rounded-sm overflow-clip bg-clip-padding border border-lime-600/30 dark:border-lime-800/30 bg-lime-600/20 dark:bg-lime-800/20 size-5 grid place-items-center shrink-0 mr-2">
              <div className="text-xs text-lime-600 dark:text-lime-700 -translate-y-px">C</div>
            </div>
            <span className={labelClasses(collapsed)}>cone</span>
          </Link>
          <Link
            to="/jsmith/1234/repo"
            title={collapsed ? "Code" : undefined}
            className={navClasses(collapsed, activePage === "repo" ? "bg-black/8 dark:bg-white/10 hover:bg-black/4 hover:dark:bg-white/6" : "")}>
            <Code className="size-5 text-black/60 dark:text-white/60 shrink-0" />
            <span className={labelClasses(collapsed)}>  Code</span>
          </Link>
          <Link
            to="/jsmith/1234/tickets"
            title={collapsed ? "Issues" : undefined}
            className={navClasses(collapsed)}>
            <CircleDot className="size-5 text-black/60 dark:text-white/60 shrink-0" />
            <span className={labelClasses(collapsed)}>  Issues</span>
          </Link>
          <Link
            to="/jsmith/1234/repo"
            title={collapsed ? "Pull Requests" : undefined}
            className={navClasses(collapsed)}>
            <GitPullRequest className="size-5 text-black/60 dark:text-white/60 shrink-0" />
            <span className={labelClasses(collapsed)}>  Pull Requests</span>
          </Link>
          <h4 className={`m-2 place-self-start font-[600] overflow-hidden transition-[opacity,max-width] duration-300 ${
            collapsed ? "opacity-0 max-w-0" : "opacity-100 max-w-xs"
          }`}>Projects</h4>
          <Link
            to="/jsmith/1234/kanban"
            title={collapsed ? "Frontend" : undefined}
            className={navClasses(collapsed, activePage === "kanban" ? "bg-black/8 dark:bg-white/10 hover:bg-black/4 hover:dark:bg-white/6" : "")}>
            <div className="block items-center rounded-sm overflow-clip bg-clip-padding border border-cyan-600/30 dark:border-cyan-800/30 bg-cyan-600/20 dark:bg-cyan-800/20 size-5 grid place-items-center shrink-0">
              <div className="text-xs text-cyan-600 dark:text-cyan-700 -translate-y-px">F</div>
            </div>
            <span className={labelClasses(collapsed)}>  Frontend</span>
          </Link>
          <Link
            to="/jsmith/1234/kanban"
            title={collapsed ? "Backend" : undefined}
            className={navClasses(collapsed)}>
            <div className="block items-center rounded-sm overflow-clip bg-clip-padding border border-amber-600/30 dark:border-amber-800/30 bg-amber-600/20 dark:bg-amber-800/20 size-5 grid place-items-center shrink-0">
              <div className="text-xs text-amber-600 dark:text-amber-700 -translate-y-px">B</div>
            </div>
            <span className={labelClasses(collapsed)}>  Backend</span>
          </Link>
        </>
      )}
    </div>
  );
};

const TimerSidebar: React.FC<CollapsibleProps> = ({ collapsed }) => {
  return (
    <div>
      <Link
        to="/jsmith"
        title={collapsed ? "John Smith" : undefined}
        className={navClasses(collapsed, "mb-2")}>
        <img className="size-5 min-w-5 rounded-sm shrink-0" src="/assets/jsmith.png" alt="John Smith" />
        <span className={labelClasses(collapsed)}>  John Smith</span>
      </Link>
      <Link
        to="/jsmith/1234/timer"
        title={collapsed ? "Productivity" : undefined}
        className={navClasses(collapsed, "bg-black/8 dark:bg-white/10 hover:bg-black/4 hover:dark:bg-white/6")}>
        <Timer className="size-5 text-black/60 dark:text-white/60 shrink-0" />
        <span className={labelClasses(collapsed)}>  Productivity</span>
      </Link>
      <Link
        to="/jsmith/1234/repo"
        title={collapsed ? "Repositories" : undefined}
        className={navClasses(collapsed)}>
        <BookMarked className="size-5 text-black/60 dark:text-white/60 shrink-0" />
        <span className={labelClasses(collapsed)}>  Repositiories</span>
      </Link>
      <Link
        to="/jsmith/1234/kanban"
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
      case "home":
        return <HomeSidebar collapsed={collapsed} />;
      case "kanban":
        return <ProjectSidebar activePage="kanban" collapsed={collapsed} />;
      case "repo":
        return <ProjectSidebar activePage="repo" collapsed={collapsed} />;
      case "tickets":
        return <ProjectSidebar activePage="tickets" collapsed={collapsed} />;
      case "timer":
        return <TimerSidebar collapsed={collapsed} />;
      default:
        return <HomeSidebar collapsed={collapsed} />;
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
