import { CircleDot, CircleUser } from "lucide-react";

const SkeletonCard: React.FC = () => {
  return (
    <div className="relative border border-black/20 dark:border-white/20 h-min rounded-lg p-2 grid grid-flow-cols gap-2">
      <div className="font-[600] grid grid-cols-[auto_auto_1fr] gap-2 place-items-center opacity-50">
        <CircleDot className="size-5" />
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
  );
};

export default SkeletonCard;
