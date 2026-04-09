import {
  Star,
  GitBranch,
  ChevronDown,
  Copy,
  Folder,
  FileText,
  GitCommitHorizontal,
  Tag,
  Rocket,
  Scale,
} from "lucide-react";
import Sidebar from "../components/Sidebar";

const SkeletonFileRow: React.FC<{ icon: React.ReactNode }> = ({ icon }) => (
  <tr className="bg-black/2 dark:bg-white/2 bg-clip-padding border-t border-white dark:border-black">
    <td className="h-12 pl-4 flex flex-auto-col place-items-center gap-4">
      {icon}
      <div className="h-2 bg-black/16 dark:bg-white/16 rounded-full w-32" />
    </td>
    <td className="h-12">
      <div className="h-2 bg-black/16 dark:bg-white/16 rounded-full w-64" />
    </td>
    <td className="h-12 pr-4">
      <div className="h-2 bg-black/16 dark:bg-white/16 rounded-full w-24 ml-auto" />
    </td>
  </tr>
);

const RepoPage: React.FC = () => {
  return (
    <>
      <Sidebar variant="repo" />
      <div className="grid grid-cols-[1fr_auto] grid-rows-[auto_1fr] dark:bg-white/8 h-[calc(100vh_-_var(--spacing)_*_16)]">
        {/* Breadcrumb */}
        <div className="border-b border-black/20 dark:border-white/20 h-12 col-span-full grid grid-cols-[auto_1fr] place-items-center pl-4 pr-2">
          <div className="grid grid-flow-col gap-2">
            <a className="grid grid-flow-col gap-2 place-items-center hover:underline" href="#">
              <img className="size-5 rounded-sm" src="/assets/acme.co.png" alt="ACME" />
              acme.co
            </a>
            <span className="opacity-50">/</span>
            <a className="font-bold grid grid-flow-col gap-2 place-items-center" href="#">
              <div className="block items-center rounded-sm overflow-clip bg-clip-padding border border-lime-600/30 dark:border-lime-800/30 bg-lime-600/20 dark:bg-lime-800/20 size-5 grid place-items-center">
                <div className="text-xs text-lime-600 dark:text-lime-700 -translate-y-px">C</div>
              </div>
              <span className="hover:underline">cone</span>
            </a>
          </div>
          <div className="grid grid-flow-col gap-[1px] place-self-end my-auto">
            <button className="py-1 px-3 rounded-l-lg bg-black/20 hover:bg-black/30 dark:bg-white/20 hover:dark:bg-white/30 cursor-pointer grid grid-flow-col place-items-center gap-2">
              <Star className="size-5" />
              <span className="font-bold">Star</span>
            </button>
            <button className="py-1 px-3 rounded-r-lg bg-black/20 hover:bg-black/30 dark:bg-white/20 hover:dark:bg-white/30 cursor-pointer grid grid-flow-col place-items-center gap-2">
              <span className="font-bold">278</span>
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="h-full grid grid-rows-[auto_auto_auto_1fr]">
          {/* Branch bar */}
          <div className="h-12 grid grid-cols-[auto_1fr] place-items-center px-2 bg-clip-padding border-b border-black/20 dark:border-white/20">
            <button className="py-1 px-2 rounded-lg bg-black/10 hover:bg-black/20 dark:bg-white/10 hover:dark:bg-white/20 cursor-pointer grid grid-flow-col place-items-center gap-2">
              <GitBranch className="size-5" />
              <span className="font-mono translate-y-px">main</span>
              <ChevronDown className="size-4 my-auto" />
            </button>
            <button className="py-1 px-2 rounded-lg bg-green-400/70 dark:bg-green-400/70 hover:bg-green-400/90 cursor-pointer grid grid-flow-col place-items-center gap-2 text-black/80 place-self-end my-auto">
              <span className="font-bold">Code</span>
              <ChevronDown className="size-4 my-auto" />
            </button>
          </div>

          {/* Last commit */}
          <div className="p-2 grid grid-cols-[auto_1fr_auto_auto] gap-2 bg-clip-padding border-b border-black/20 dark:border-white/20">
            <a href="#" className="block rounded-md overflow-clip size-12">
              <img src="/assets/jsmith.png" alt="John Smith" />
            </a>
            <div className="grid grid-flow-row">
              <div className="font-[700]">
                feat(auth): add JWT refresh token rotation support
              </div>
              <div>
                <a href="#" className="hover:underline">John Smith</a>{" "}
                <span className="text-black/50 dark:text-white/50">
                  authored 4 days ago and committed 3 days ago.
                </span>
              </div>
            </div>
            <div className="grid grid-flow-col my-auto">
              <div className="py-1 px-3 rounded-l-lg bg-black/10 dark:bg-white/10 grid grid-flow-col place-items-center gap-2 text-black/60 dark:text-white/60">
                <span className="font-mono translate-y-px">884d29e5</span>
              </div>
              <button className="py-1 px-2 rounded-r-lg bg-black/20 hover:bg-black/30 dark:bg-white/20 hover:dark:bg-white/30 cursor-pointer grid grid-flow-col place-items-center gap-2 text-black/60 dark:text-white/60">
                <Copy className="size-4" />
              </button>
            </div>
            <button className="py-1 px-2 rounded-lg bg-black/20 hover:bg-black/30 dark:bg-white/20 hover:dark:bg-white/30 cursor-pointer grid grid-flow-col place-items-center gap-2 my-auto h-8 mr-2 font-[500]">
              History
            </button>
          </div>

          {/* File table */}
          <table className="table-fixed bg-clip-padding border-b border-black/20 dark:border-white/20">
            <thead>
              <tr className="h-12 bg-black/8 dark:bg-white/8">
                <th className="w-[40%] text-left pl-4">Name</th>
                <th className="w-[40%] text-left">Last commit</th>
                <th className="w-[20%] text-right pr-4">Last update</th>
              </tr>
            </thead>
            <tbody>
              <SkeletonFileRow icon={<Folder className="size-4" />} />
              <SkeletonFileRow icon={<Folder className="size-4" />} />
              <SkeletonFileRow icon={<Folder className="size-4" />} />
              <SkeletonFileRow icon={<Folder className="size-4" />} />
              <SkeletonFileRow icon={<i className="devicon-typescript-plain" />} />
              <SkeletonFileRow icon={<i className="devicon-markdown-original" />} />
              <SkeletonFileRow icon={<i className="devicon-rust-original" />} />
            </tbody>
          </table>

          {/* README */}
          <div>
            <div className="h-12 bg-black/8 dark:bg-white/8 font-[500] grid grid-cols-[auto_auto_1fr] place-items-center bg-clip-padding border-b border-black/20 dark:border-white/20">
              <FileText className="size-5 inline mx-4" />
              README.md
            </div>
            <div className="p-8">
              <h1 id="cone" className="text-3xl font-bold mb-2">Cone</h1>
              <blockquote className="place-items-center bg-clip-padding border-l-4 border-black/20 dark:border-white/20 p-2 pl-4 my-2 bg-black/6 dark:bg-white/3">
                <p>A modern, open-source Git productivity suite that seamlessly combines project management and developer ergonomics.</p>
              </blockquote>
              <p>Cone integrates source control, issue tracking, code review, and project planning into one fast, developer-first platform. Self-host it, extend it, and own your workflow.</p>
              <hr className="my-4 border-black/20 dark:border-white/20" />
              <h2 className="text-2xl font-bold my-4" id="features">✨ Features</h2>
              <ul className="list-disc pl-8">
                <li>🧠 <strong>Unified Workflows</strong> — Issues, pull requests, and commits are deeply linked.</li>
                <li>⚡ <strong>Blazing Fast UI</strong> — Built for performance and minimal friction.</li>
                <li>🔐 <strong>Self-Hosted First</strong> — Full control over your data.</li>
                <li>🔄 <strong>Git Native</strong> — Designed around Git, not bolted onto it.</li>
                <li>📊 <strong>Agile &amp; Beyond</strong> — Kanban, sprints, roadmaps, milestones.</li>
                <li>🔌 <strong>Extensible</strong> — Plugin system + API.</li>
              </ul>
              <hr className="my-4 border-black/20 dark:border-white/20" />
              <h2 className="text-2xl font-bold my-2" id="quick-start">🚀 Quick Start</h2>
              <pre className="p-4 mt-4 rounded-lg bg-black/4 dark:bg-white/4">
                <code className="lang-bash">
{`# Clone the repository
git clone https://github.com/your-org/cone.git

cd cone

# Start with Docker
docker compose up -d`}
                </code>
              </pre>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="border-l border-black/20 dark:border-white/20 h-full w-80 p-4 flex flex-col gap-2">
          <div>
            <h4 className="font-bold">Project information</h4>
            A modern, open-source git productivity suite.
          </div>
          <div className="mt-1 h-2.5 w-full overflow-clip rounded-full grid grid-cols-[55%_25%_10%_10%] gap-[1px]">
            <span className="w-full bg-amber-600" />
            <span className="w-full bg-sky-600" />
            <span className="w-full bg-lime-600" />
            <span className="w-full bg-gray-400" />
          </div>
          <hr className="border-black/20 dark:border-white/20 rounded-full my-1" />
          <a href="#" className="hover:underline grid grid-cols-[auto_auto_auto_1fr] gap-2 place-items-center">
            <GitCommitHorizontal className="size-5 inline" />
            <span className="font-bold">5000</span> Commits
          </a>
          <a href="#" className="hover:underline grid grid-cols-[auto_auto_auto_1fr] gap-2 place-items-center">
            <GitBranch className="size-5 inline" />
            <span className="font-bold">4</span> Branches
          </a>
          <a href="#" className="hover:underline grid grid-cols-[auto_auto_auto_1fr] gap-2 place-items-center">
            <Tag className="size-5 inline" />
            <span className="font-bold">26</span> Tags
          </a>
          <a href="#" className="hover:underline grid grid-cols-[auto_auto_auto_1fr] gap-2 place-items-center">
            <Rocket className="size-5 inline" />
            <span className="font-bold">18</span> Releases
          </a>
          <hr className="border-black/20 dark:border-white/20 rounded-full my-1" />
          <h4 className="font-bold">Pinned</h4>
          <a href="#" className="hover:underline grid grid-cols-[auto_auto_auto_1fr] gap-2 place-items-center">
            <FileText className="size-5 inline" />
            README
          </a>
          <a href="#" className="hover:underline grid grid-cols-[auto_auto_auto_1fr] gap-2 place-items-center">
            <FileText className="size-5 inline" />
            CONTRIBUTING
          </a>
          <a href="#" className="hover:underline grid grid-cols-[auto_auto_auto_1fr] gap-2 place-items-center">
            <Scale className="size-5 inline" />
            GPLv3 License
          </a>
          <hr className="border-black/20 dark:border-white/20 rounded-full my-1" />
          <div>
            <h4 className="font-bold">Created on</h4>
            February 02, 2026
          </div>
        </div>
      </div>
    </>
  );
};

export default RepoPage;
