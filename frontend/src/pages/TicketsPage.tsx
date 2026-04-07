import {
  ListFilter,
  Search,
  Plus,
  Square,
  ChevronDown,
  GripVertical,
} from "lucide-react";
import Sidebar from "../components/Sidebar";

interface TicketRow {
  key: string;
  summary: string;
  creator: string;
  creatorImg: string;
  assignee: string;
  assigneeImg: string;
  tags: { label: string; color: string }[];
  status: { label: string; color: string };
  created: string;
}

const tickets: TicketRow[] = [
  {
    key: "CONE-18",
    summary: "feat(repo): initialize Git repository service abstraction",
    creator: "jsmith",
    creatorImg: "/assets/jsmith.png",
    assignee: "jsmith",
    assigneeImg: "/assets/jsmith.png",
    tags: [
      { label: "Feature", color: "bg-green-400/80" },
      { label: "Frontend", color: "bg-blue-400/80" },
    ],
    status: { label: "Completed", color: "bg-green-400/80" },
    created: "10/Feb/2026",
  },
  {
    key: "CONE-19",
    summary: "feat(auth): implement OAuth + local account login",
    creator: "jsmith",
    creatorImg: "/assets/jsmith.png",
    assignee: "jsmith",
    assigneeImg: "/assets/jsmith.png",
    tags: [
      { label: "Feature", color: "bg-green-400/80" },
      { label: "Frontend", color: "bg-blue-400/80" },
      { label: "Backend", color: "bg-amber-400/80" },
    ],
    status: { label: "In progress", color: "bg-cyan-400/80" },
    created: "10/Feb/2026",
  },
  {
    key: "CONE-20",
    summary: "fix(repo): incorrect diff rendering for renamed files",
    creator: "jsmith",
    creatorImg: "/assets/jsmith.png",
    assignee: "jsmith",
    assigneeImg: "/assets/jsmith.png",
    tags: [
      { label: "Bug", color: "bg-red-400/80" },
      { label: "Frontend", color: "bg-blue-400/80" },
    ],
    status: { label: "Not Started", color: "bg-white/50" },
    created: "10/Feb/2026",
  },
];

const SkeletonRow: React.FC = () => (
  <tr className="odd:bg-black/2 odd:dark:bg-white/2 bg-clip-padding border-t border-white dark:border-black">
    <td className="h-12 px-4 w-1 whitespace-nowrap">
      <Square className="size-5" />
    </td>
    <td className="h-12 px-4 w-1 whitespace-nowrap">
      <div className="h-2 bg-black/16 dark:bg-white/16 rounded-full w-16" />
    </td>
    <td className="px-4">
      <a href="#" className="font-[700] hover:underline">
        <div className="h-2 bg-black/16 dark:bg-white/16 rounded-full w-32" />
      </a>
    </td>
    <td className="px-4 whitespace-nowrap">
      <a className="flex gap-2 place-items-center font-[700] hover:underline" href="#">
        <div className="h-2 bg-black/16 dark:bg-white/16 rounded-full w-16" />
      </a>
    </td>
    <td className="px-4 whitespace-nowrap">
      <a className="flex gap-2 place-items-center font-[700] hover:underline" href="#">
        <div className="h-2 bg-black/16 dark:bg-white/16 rounded-full w-16" />
      </a>
    </td>
    <td className="h-12 whitespace-nowrap px-2 py-4">
      <div className="gap-2 flex flex-wrap">
        <div className="bg-black/10 hover:bg-black/20 dark:bg-white/10 hover:bg-white/20 size-fit p-2 rounded-md font-[600] text-black/90">
          <div className="h-2 bg-black/16 dark:bg-white/16 rounded-full w-16" />
        </div>
        <button className="bg-black/10 hover:bg-black/20 dark:bg-white/10 hover:bg-white/20 cursor-pointer size-fit p-0.5 rounded-md">
          <Plus className="size-5" />
        </button>
      </div>
    </td>
    <td className="px-4">
      <div className="bg-white/50 size-fit px-1 rounded-md font-[600] text-black/90 text-nowrap grid grid-flow-col place-items-center gap-1 p-2">
        <div className="h-2 bg-black/40 rounded-full w-16" />
        <ChevronDown className="size-3" />
      </div>
    </td>
    <td className="px-4 text-nowrap">
      <div className="h-2 bg-black/16 dark:bg-white/16 rounded-full w-24" />
    </td>
    <td className="h-12 px-4 w-1 whitespace-nowrap">
      <GripVertical className="size-5" />
    </td>
  </tr>
);

const TicketsPage: React.FC = () => {
  return (
    <>
      <Sidebar variant="tickets" />
      <div className="grid grid-rows-[auto_auto_1fr] dark:bg-white/8">
        {/* Breadcrumb */}
        <div className="border-b border-black/20 dark:border-white/20 h-12 col-span-full grid grid-cols-[auto_1fr] place-items-center pl-4 pr-2">
          <div className="grid grid-flow-col gap-2">
            <a className="grid grid-flow-col gap-2 place-items-center hover:underline" href="#">
              <img className="size-5 rounded-sm" src="/assets/acme.co.png" alt="ACME" />
              acme.co
            </a>
            <span className="opacity-50">/</span>
            <a className="font-bold grid grid-flow-col gap-2 place-items-center hover:underline" href="#">
              Tickets
            </a>
          </div>
        </div>
        {/* Filter bar */}
        <div className="border-b border-black/20 dark:border-white/20 h-16 col-span-full grid grid-cols-[1fr_auto] place-items-center px-3 gap-2">
          <div className="grid grid-cols-[auto_1fr_auto] w-full">
            <button className="py-1.5 px-2.5 rounded-l-lg bg-clip-padding bg-black/10 hover:bg-black/20 dark:bg-white/10 hover:dark:bg-white/20 cursor-pointer grid grid-flow-col place-items-center gap-2 border-l border-y border-black/20 dark:border-white/20">
              <ListFilter className="size-5" />
              Filters
            </button>
            <input
              placeholder="Search tickets..."
              defaultValue="is:ticket"
              className="font-mono py-1.5 px-2.5 w-full border border-black/20 dark:border-white/20" />
            <button className="py-1.5 px-2.5 rounded-r-lg bg-clip-padding bg-black/10 hover:bg-black/20 dark:bg-white/10 hover:dark:bg-white/20 cursor-pointer grid grid-flow-col place-items-center gap-2 border-r border-y border-black/20 dark:border-white/20">
              <Search className="size-5" />
            </button>
          </div>
          <button className="p-1.5 rounded-lg bg-green-400/70 dark:bg-green-400/70 hover:bg-green-400/90 text-black cursor-pointer grid grid-flow-col place-items-center gap-2">
            <Plus className="size-5" />
            New ticket
          </button>
        </div>
        {/* Table */}
        <div className="grid grid-rows-[auto_1fr] max-h-[calc(100vh_-_(var(--spacing)_*_44))] overflow-scroll">
          <table className="table-fixed h-fit">
            <thead>
              <tr className="h-12 bg-black/8 dark:bg-white/8">
                <th className="px-4">
                  <Square className="size-5" />
                </th>
                <th className="px-4 text-left">Key</th>
                <th className="px-4 text-left">Summary</th>
                <th className="px-4 text-left">
                  <div className="grid grid-cols-[auto_auto_1fr] gap-2">
                    Creator
                    <ChevronDown className="text-black/60 dark:text-white/60 size-4 my-auto" />
                  </div>
                </th>
                <th className="px-4 text-left">
                  <div className="grid grid-cols-[auto_auto_1fr] gap-2">
                    Assignee
                    <ChevronDown className="text-black/60 dark:text-white/60 size-4 my-auto" />
                  </div>
                </th>
                <th className="px-4 text-left">
                  <div className="grid grid-cols-[auto_auto_1fr] gap-2">
                    Tags
                    <ChevronDown className="text-black/60 dark:text-white/60 size-4 my-auto" />
                  </div>
                </th>
                <th className="px-4 text-left">
                  <div className="grid grid-cols-[auto_auto_1fr] gap-2">
                    Status
                    <ChevronDown className="text-black/60 dark:text-white/60 size-4 my-auto" />
                  </div>
                </th>
                <th className="px-4 text-left">
                  <div className="grid grid-cols-[auto_auto_1fr] gap-2">
                    Created
                    <ChevronDown className="text-black/60 dark:text-white/60 size-4 my-auto" />
                  </div>
                </th>
                <th className="px-4 text-right" />
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr
                  key={ticket.key}
                  className="odd:bg-black/2 odd:dark:bg-white/2 bg-clip-padding border-t border-white dark:border-black">
                  <td className="h-12 px-4 w-1 whitespace-nowrap">
                    <Square className="size-5" />
                  </td>
                  <td className="h-12 px-4 w-1 whitespace-nowrap">{ticket.key}</td>
                  <td className="px-4">
                    <a href="#" className="font-[700] hover:underline">
                      {ticket.summary}
                    </a>
                  </td>
                  <td className="px-4 whitespace-nowrap">
                    <a className="flex gap-2 place-items-center font-[700] hover:underline" href="#">
                      <img className="size-5 rounded-md" src={ticket.creatorImg} alt={ticket.creator} />
                      {ticket.creator}
                    </a>
                  </td>
                  <td className="px-4 whitespace-nowrap">
                    <a className="flex gap-2 place-items-center font-[700] hover:underline" href="#">
                      <img className="size-5 rounded-md" src={ticket.assigneeImg} alt={ticket.assignee} />
                      {ticket.assignee}
                    </a>
                  </td>
                  <td className="h-12 whitespace-nowrap px-2 py-4">
                    <div className="gap-2 flex flex-wrap">
                      {ticket.tags.map((tag) => (
                        <div
                          key={tag.label}
                          className={`${tag.color} size-fit px-1 rounded-md font-[600] text-black/90`}
                        >
                          {tag.label}
                        </div>
                      ))}
                      <button className="bg-black/10 hover:bg-black/20 dark:bg-white/10 hover:bg-white/20 cursor-pointer size-fit p-0.5 rounded-md">
                        <Plus className="size-5" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4">
                    <div
                      className={`${ticket.status.color} size-fit px-1 rounded-md font-[600] text-black/90 text-nowrap grid grid-flow-col place-items-center gap-1`}>
                      {ticket.status.label}
                      <ChevronDown className="size-3" />
                    </div>
                  </td>
                  <td className="px-4 text-nowrap">{ticket.created}</td>
                  <td className="h-12 px-4 w-1 whitespace-nowrap">
                    <GripVertical className="size-5" />
                  </td>
                </tr>
              ))}
              {Array.from({ length: 30 }).map((_, i) => (
                <SkeletonRow key={`skeleton-${i}`} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default TicketsPage;
