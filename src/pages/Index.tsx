
import { YetiSidebar } from "@/components/YetiSidebar";
import { YetiChatWindow } from "@/components/YetiChatWindow";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200 flex">
      <YetiSidebar />
      <section className="flex-1 flex flex-col h-screen">
        <header className="h-20 flex px-8 py-2 items-center border-b border-border bg-white/70 backdrop-blur-md shadow-sm">
          <span className="text-2xl font-semibold flex items-center gap-2 text-blue-900">
            Welcome to <span className="font-extrabold tracking-tight">Yeti</span> Chatbot
          </span>
          <span className="ml-auto px-3 py-1 bg-slate-200 text-slate-700 rounded text-xs font-medium">
            Alpha
          </span>
        </header>
        <div className="flex-1 min-h-0 flex flex-col">
          <YetiChatWindow />
        </div>
      </section>
    </div>
  );
};

export default Index;
