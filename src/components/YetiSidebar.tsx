
import { Github, Twitter, Brain, Newspaper, Search, Repeat, Globe2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

const integrations = [
  { name: "GitHub", icon: <Github size={22} />, comingSoon: true },
  { name: "Twitter", icon: <Twitter size={22} />, comingSoon: true },
  { name: "OpenAI", icon: <Brain size={22} />, comingSoon: true },
  { name: "News", icon: <Newspaper size={22} />, comingSoon: true },
  { name: "Web Search", icon: <Search size={22} />, comingSoon: true },
  { name: "Inter-Chat", icon: <Repeat size={22} />, comingSoon: true },
  { name: "More", icon: <Globe2 size={22} />, comingSoon: true },
];

export function YetiSidebar() {
  return (
    <aside className="w-60 h-full flex flex-col bg-gradient-to-b from-blue-50/80 to-blue-200/70 border-r border-border p-0">
      <div className="h-20 flex px-6 items-center border-b border-border">
        <span className="text-2xl font-extrabold text-blue-900">🧊 Yeti</span>
      </div>
      <nav className="flex-1 py-8 space-y-2">
        {integrations.map((int) => (
          <Button
            key={int.name}
            disabled={int.comingSoon}
            variant="ghost"
            className="w-full justify-start hover:bg-blue-100/70 transition"
          >
            {int.icon}
            <span className="ml-3 font-medium text-[1.06rem]">{int.name}</span>
            {int.comingSoon && (
              <span className="ml-auto text-xs bg-slate-200 text-slate-600 rounded px-2 py-0.5">Soon</span>
            )}
          </Button>
        ))}
      </nav>
      <div className="p-4 mt-auto flex items-center justify-between text-xs text-muted-foreground">
        <span>Made with ❄️</span>
        <a href="https://lovable.dev" className="hover:underline text-blue-700" target="_blank" rel="noopener noreferrer">
          Lovable
        </a>
      </div>
    </aside>
  );
}
