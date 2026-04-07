import {
  Settings,
  Check,
  Tickets,
  CircleDot,
  GitPullRequestArrow,
  CircleUser,
  Plus,
} from "lucide-react";
import Sidebar from "../components/Sidebar";

const TimerPage: React.FC = () => {
  return (
    <>
      <Sidebar variant="timer" />
      <div className="grid grid-rows-[auto_auto_1fr] dark:bg-white/8">
        {/* Breadcrumb */}
        <div className="border-b border-black/20 dark:border-white/20 h-12 col-span-full grid grid-cols-[auto_1fr] place-items-center pl-4 pr-2">
          <div className="grid grid-flow-col gap-2">
            <a className="grid grid-flow-col gap-2 place-items-center hover:underline" href="#">
              <img className="size-5 rounded-sm" src="/assets/jsmith.png" alt="jsmith" />
              jsmith
            </a>
            <span className="opacity-50">/</span>
            <a className="font-bold hover:underline" href="#">
              Productivity
            </a>
          </div>
        </div>
        {/* Timer content */}
        <div className="h-200 grid grid-cols-[1fr_auto]">
          {/* Timer */}
          <div className="grid grid-cols-[1fr_1fr_auto] w-fit h-fit gap-4 place-self-center">
            <h1 className="col-span-full font-mono text-6xl font-[500]">01:51:09</h1>
            <button className="py-1.5 px-2.5 rounded-lg bg-clip-padding dark:bg-blue-300/80 hover:dark:bg-blue-300 text-black font-[500] cursor-pointer grid grid-flow-col place-items-center gap-2 border dark:border-blue-200">
              Resume
            </button>
            <button className="py-1.5 px-2.5 rounded-lg bg-clip-padding bg-black/10 hover:bg-black/20 dark:bg-white/10 hover:dark:bg-white/20 cursor-pointer grid grid-flow-col place-items-center gap-2 border border-black/20 dark:border-white/20">
              End session
            </button>
            <button className="p-2 w-fit rounded-lg bg-clip-padding bg-black/10 hover:bg-black/20 dark:bg-white/10 hover:dark:bg-white/20 cursor-pointer grid grid-flow-col place-items-center gap-2 border border-black/20 dark:border-white/20 place-self-center">
              <Settings className="size-5" />
            </button>
            <h3 className="col-span-full place-self-center m-8 opacity-50">
              Next break in 10 minutes
            </h3>
          </div>
          {/* Right panel */}
          <div className="w-120 m-8 grid grid-rows-[auto_auto_1fr] gap-2">
            {/* In focus */}
            <div className="grid grid-flow-row gap-2">
              <div className="grid grid-cols-[auto_1fr] place-items-center">
                <h4 className="font-[500] text-lg">In focus</h4>
                <button className="py-1.5 px-2.5 w-fit rounded-lg bg-clip-padding dark:bg-green-400/80 text-black font-[500] grid grid-flow-col place-items-center gap-2 border dark:border-green-200 place-self-end opacity-30">
                  <Check className="size-5" />
                  Mark complete
                </button>
              </div>
              <div className="relative border border-dashed border-black/20 dark:border-white/20 h-32 rounded-lg p-2 grid grid-flow-cols gap-2" />
            </div>
            {/* Assigned cards */}
            <div className="grid grid-flow-row gap-2">
              <h4 className="font-[500] text-lg">Assigned to you</h4>
              {/* Card 1 */}
              <div className="relative border border-black/20 dark:border-white/20 h-min rounded-lg p-2 grid grid-flow-cols gap-2 cursor-move">
                <div className="font-[600] grid grid-cols-[auto_auto_1fr] gap-2 opacity-50">
                  <Tickets className="size-5" />
                  CONE-05
                </div>
                <h4 className="font-[600]">Project Dashboard Widgets</h4>
                <div>Build customizable dashboard with draggable widgets</div>
                <div className="flex flex-auto-row gap-2">
                  <div className="bg-green-400/80 size-fit px-1 rounded-md font-[600] text-black/90">Feature</div>
                  <div className="bg-blue-400/80 size-fit px-1 rounded-md font-[600] text-black/90">Frontend</div>
                  <div className="bg-purple-400/80 size-fit px-1 rounded-md font-[600] text-black/90">Projects</div>
                </div>
                <CircleUser className="absolute size-5 right-2 top-2 opacity-50" />
              </div>
              {/* Card 2 */}
              <div className="relative border border-black/20 dark:border-white/20 h-min rounded-lg p-2 grid grid-flow-cols gap-2 cursor-move">
                <div className="font-[600] grid grid-cols-[auto_auto_1fr] gap-2 opacity-50">
                  <CircleDot className="size-5" />
                  CONE-ISSUE-40
                </div>
                <h4 className="font-[600]">Diff Viewer Freezes on Large Pull Requests</h4>
                <div>Opening a PR with ~400 changed files causes the browser tab to freeze for ~10 seconds.</div>
                <div className="flex flex-auto-row gap-2">
                  <div className="bg-red-400/80 size-fit px-1 rounded-md font-[600] text-black/90">Performance</div>
                  <div className="bg-blue-400/80 size-fit px-1 rounded-md font-[600] text-black/90">Frontend</div>
                </div>
                <CircleUser className="absolute size-5 right-2 top-2 opacity-50" />
              </div>
              {/* Skeleton card */}
              <div className="relative border border-black/20 dark:border-white/20 h-min rounded-lg p-2 grid grid-flow-cols gap-2 cursor-move">
                <div className="font-[600] grid grid-cols-[auto_auto_1fr] gap-2 place-items-center opacity-50">
                  <GitPullRequestArrow className="size-5" />
                  <div className="h-2 bg-black/30 dark:bg-white/30 rounded-full w-16" />
                </div>
                <h4 className="font-[600]">
                  <div className="h-2 bg-black/30 dark:bg-white/30 rounded-full w-48 my-1" />
                </h4>
                <div>
                  <div className="h-2 bg-black/16 dark:bg-white/16 rounded-full w-80 my-1" />
                  <div className="h-2 bg-black/16 dark:bg-white/16 rounded-full w-50 my-1 mt-2" />
                </div>
                <div className="flex flex-auto-row gap-2">
                  <div className="bg-black/10 hover:bg-black/20 dark:bg-white/10 hover:bg-white/20 size-fit p-2 rounded-md font-[600] text-black/90">
                    <div className="h-2 bg-black/16 dark:bg-white/16 rounded-full w-16" />
                  </div>
                </div>
                <CircleUser className="absolute size-5 right-2 top-2 opacity-50" />
              </div>
            </div>
            <button className="py-1.5 px-2.5 rounded-lg bg-clip-padding bg-black/10 hover:bg-black/20 dark:bg-white/10 hover:dark:bg-white/20 cursor-pointer grid grid-flow-col place-items-center gap-2 border border-black/20 dark:border-white/20 w-fit h-fit">
              <Plus className="size-5" />
              Add more
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TimerPage;
