import { CheckCircle2 } from "lucide-react";

type Status = "LISTED" | "MATCHED" | "PICKED" | "DELIVERED";

interface StatusTimelineProps {
  currentStatus: Status;
}

const StatusTimeline = ({ currentStatus }: StatusTimelineProps) => {
  const statuses: { key: Status; label: string }[] = [
    { key: "LISTED", label: "Listed" },
    { key: "MATCHED", label: "Matched" },
    { key: "PICKED", label: "Picked Up" },
    { key: "DELIVERED", label: "Delivered" },
  ];

  const currentIndex = statuses.findIndex((s) => s.key === currentStatus);

  return (
    <div className="flex items-center justify-between w-full max-w-3xl mx-auto py-8">
      {statuses.map((status, index) => {
        const isCompleted = index <= currentIndex;
        const isActive = index === currentIndex;

        return (
          <div key={status.key} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  isCompleted
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                } ${isActive ? "ring-4 ring-primary/20" : ""}`}
              >
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <span
                className={`mt-2 text-sm font-medium ${
                  isCompleted ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {status.label}
              </span>
            </div>
            {index < statuses.length - 1 && (
              <div
                className={`flex-1 h-1 mx-2 transition-all ${
                  index < currentIndex ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StatusTimeline;
