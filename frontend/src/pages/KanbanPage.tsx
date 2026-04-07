import { Circle, Search, Eye } from "lucide-react";
import Sidebar from "../components/Sidebar";
import KanbanCard from "../components/KanbanCard";
import SkeletonCard from "../components/SkeletonCard";

// NOTE: this page will be merged with TicketsPage
// -> tickets can be displayed as a Kanban board or as a tabular view

const KanbanPage: React.FC = () => {
  return (
    <>
      <Sidebar variant="kanban" />
      <div className="grid grid-rows-[auto_auto_1fr] dark:bg-white/8">
        {/* Breadcrumb */}
        <div className="border-b border-black/20 dark:border-white/20 h-12 col-span-full grid grid-cols-[auto_1fr] place-items-center pl-4 pr-2">
          <div className="grid grid-flow-col gap-2">
            <a className="grid grid-flow-col gap-2 place-items-center hover:underline" href="#">
              <img className="size-5 rounded-sm" src="/assets/acme.co.png" alt="ACME" />
              acme.co
            </a>
            <span className="opacity-50">/</span>
            <a className="grid grid-flow-col gap-2 place-items-center" href="#">
              <div className="block items-center rounded-sm overflow-clip bg-clip-padding border border-lime-600/30 dark:border-lime-800/30 bg-lime-600/20 dark:bg-lime-800/20 size-5 grid place-items-center">
                <div className="text-xs text-lime-600 dark:text-lime-700 -translate-y-px">C</div>
              </div>
              <span className="hover:underline">cone</span>
            </a>
            <span className="opacity-50">/</span>
            <a className="font-bold hover:underline" href="#">
              Frontend
            </a>
          </div>
        </div>
        {/* Filter bar */}
        <div className="border-b border-black/20 dark:border-white/20 h-16 grid grid-cols-[1fr_auto] place-items-center px-3 gap-2">
          <div className="grid grid-cols-[1fr_auto] w-full">
            <input
              placeholder="Filter by keyword"
              className="font-mono py-1.5 px-2.5 w-full rounded-l-lg border border-black/20 dark:border-white/20" />
            <button className="py-1.5 px-2.5 rounded-r-lg bg-clip-padding bg-black/10 hover:bg-black/20 dark:bg-white/10 hover:dark:bg-white/20 cursor-pointer grid grid-flow-col place-items-center gap-2 border-r border-y border-black/20 dark:border-white/20">
              <Search className="size-5" />
            </button>
          </div>
          <div className="grid grid-flow-col gap-2 place-self-end my-auto">
            <button className="py-1.5 px-2.5 rounded-lg bg-black/20 hover:bg-black/30 dark:bg-white/20 hover:dark:bg-white/30 cursor-pointer grid grid-flow-col place-items-center gap-2">
              <Eye className="size-5" />
              View
            </button>
          </div>
        </div>
        {/* Board */}
        <div className="grid grid-cols-[auto_auto_auto_1fr] max-h-[calc(100vh_-_(var(--spacing)_*_28))] max-w-[calc(100vw_-_224px)] overflow-scroll">
          {/* Not started column */}
          <div className="w-100 grid grid-rows-[auto_1fr] bg-clip-padding ml-[-1px] border-x border-black/20 dark:border-white/20">
            <div className="grid grid-cols-[auto_auto_1fr] gap-4 place-items-center m-4 mb-2">
              <Circle className="text-red-500/80 size-5" />
              <h4 className="font-[600] text-lg">Not started</h4>
            </div>
            <div className="grid grid-rows-[auto_auto_auto_auto_1fr] gap-2 p-2">
              <KanbanCard
                ticketKey="CONE-04"
                title="Pull Request Review UI"
                description="Create a PR review experience combining productivity features with Git-native views."
                tags={[
                  { label: "Feature", color: "bg-green-400/80" },
                  { label: "Frontend", color: "bg-blue-400/80" },
                ]}
                assigneeImg="/assets/jsmith.png" />
              <KanbanCard
                ticketKey="CONE-05"
                title="Project Dashboard Widgets"
                description="Build customizable dashboard with draggable widgets"
                tags={[
                  { label: "Feature", color: "bg-green-400/80" },
                  { label: "Frontend", color: "bg-blue-400/80" },
                  { label: "Projects", color: "bg-purple-400/80" },
                ]} />
              <KanbanCard
                ticketKey="CONE-ISSUE-40"
                title="Diff Viewer Freezes on Large Pull Requests"
                description="Opening a PR with ~400 changed files causes the browser tab to freeze for ~10 seconds."
                tags={[
                  { label: "Performance", color: "bg-red-400/80" },
                  { label: "Frontend", color: "bg-blue-400/80" },
                ]}
                iconType="issue" />
              <SkeletonCard />
              <div className="h-full" />
            </div>
          </div>
          {/* In progress column */}
          <div className="w-100 grid grid-rows-[auto_auto_1fr] bg-clip-padding mr-[-1px] border-r border-black/20 dark:border-white/20">
            <div className="grid grid-cols-[auto_auto_1fr] gap-4 place-items-center m-4 mb-2">
              <Circle className="text-fuchsia-500/80 size-5" />
              <h4 className="font-[600] text-lg">In progress</h4>
            </div>
            <div className="grid grid-rows-[auto_auto_1fr] gap-2 p-2">
              <KanbanCard
                ticketKey="CONE-ISSUE-48"
                title="Scroll Duplicates Issues"
                description="Scrolling down in Issue List sometimes duplicates previously loaded issues."
                tags={[
                  { label: "Bug", color: "bg-red-400/80" },
                  { label: "Frontend", color: "bg-blue-400/80" },
                ]}
                assigneeImg="/assets/jsmith.png"
                iconType="issue" />
              <SkeletonCard />
              <div className="h-full" />
            </div>
          </div>
          {/* Completed column */}
          <div className="w-100 grid grid-rows-[auto_1fr] bg-clip-padding border-r border-black/20 dark:border-white/20">
            <div className="grid grid-cols-[auto_auto_1fr] gap-4 place-items-center m-4 mb-2">
              <Circle className="text-lime-500/80 size-5" />
              <h4 className="font-[600] text-lg">Completed</h4>
            </div>
            <div className="grid grid-rows-[auto_auto_1fr] gap-2 p-2">
              <SkeletonCard />
              <SkeletonCard />
              <div className="h-full" />
            </div>
          </div>
          <div />
        </div>
      </div>
    </>
  );
};

export default KanbanPage;
