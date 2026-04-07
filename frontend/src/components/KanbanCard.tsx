import { Tickets, CircleDot, CircleUser } from "lucide-react";

interface KanbanCardProps {
  ticketKey: string;
  title: string;
  description: string;
  tags: { label: string; color: string }[];
  assigneeImg?: string;
  iconType?: "ticket" | "issue";
}

const KanbanCard: React.FC<KanbanCardProps> = ({
  ticketKey,
  title,
  description,
  tags,
  assigneeImg,
  iconType = "ticket",
}) => {
  return (
    <div className="relative border border-black/20 dark:border-white/20 h-min rounded-lg p-2 grid grid-flow-cols gap-2">
      <div className="font-[600] grid grid-cols-[auto_auto_1fr] gap-2 opacity-50">
        {iconType === "ticket" ? (
          <Tickets className="size-5" />
        ) : (
          <CircleDot className="size-5" />
        )}
        {ticketKey}
      </div>
      <h4 className="font-[600]">{title}</h4>
      <div>{description}</div>
      <div className="flex flex-auto-row gap-2">
        {tags.map((tag) => (
          <div
            key={tag.label}
            className={`${tag.color} size-fit px-1 rounded-md font-[600] text-black/90`}>
            {tag.label}
          </div>
        ))}
      </div>
      {assigneeImg ? (
        <img
          className="absolute size-5 rounded-md right-2 top-2"
          src={assigneeImg}
          alt="Assignee" />
      ) : (
        <CircleUser className="absolute size-5 right-2 top-2 opacity-50" />
      )}
    </div>
  );
};

export default KanbanCard;
