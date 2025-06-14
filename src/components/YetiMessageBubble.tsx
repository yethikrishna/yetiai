
import { cn } from "@/lib/utils";

interface YetiMessageBubbleProps {
  sender: "user" | "yeti";
  message: string;
  time?: string;
}

export function YetiMessageBubble({ sender, message, time }: YetiMessageBubbleProps) {
  const isUser = sender === "user";
  
  return (
    <div className={cn(
      "flex mb-2 group",
      isUser ? "justify-end" : "justify-start"
    )}>
      {!isUser && (
        <div className="flex-shrink-0 flex items-end">
          <span className="mr-2 text-3xl">🧊</span>
        </div>
      )}
      <div
        className={cn(
          "max-w-xl rounded-lg px-5 py-3 shadow transition border",
          isUser
            ? "ml-12 bg-blue-100 border-blue-200 text-blue-900"
            : "mr-12 bg-white border-slate-100 text-black"
        )}
      >
        <span className="block">{message}</span>
        {time && <span className="block mt-2 text-right text-xs text-muted-foreground opacity-70">{time}</span>}
      </div>
      {isUser && (
        <div className="flex-shrink-0 flex items-end">
          <span className="ml-2 text-lg">🧑‍💻</span>
        </div>
      )}
    </div>
  );
}
