
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
      "flex gap-3 group",
      isUser ? "justify-end" : "justify-start"
    )}>
      {!isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm">
            🧊
          </div>
        </div>
      )}
      
      <div className={cn(
        "max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-3 shadow-sm",
        isUser
          ? "bg-blue-600 text-white rounded-br-lg"
          : "bg-white border border-slate-200 text-slate-900 rounded-bl-lg"
      )}>
        <div className="text-sm leading-relaxed whitespace-pre-wrap">{message}</div>
        {time && (
          <div className={cn(
            "text-xs mt-2 opacity-70",
            isUser ? "text-blue-100" : "text-slate-500"
          )}>
            {time}
          </div>
        )}
      </div>

      {isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white text-sm">
            👤
          </div>
        </div>
      )}
    </div>
  );
}
