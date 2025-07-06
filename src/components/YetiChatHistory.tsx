import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  History, 
  Search, 
  Trash2, 
  Edit3, 
  MessageSquare,
  Calendar,
  Clock
} from "lucide-react";
import { useYetiChatMemory, ChatSession } from "@/hooks/useYetiChatMemory";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface YetiChatHistoryProps {
  onSessionSelect: (sessionId: string) => void;
  onNewSession: () => void;
  currentSessionId?: string | null;
  className?: string;
}

export function YetiChatHistory({ 
  onSessionSelect, 
  onNewSession, 
  currentSessionId,
  className = ""
}: YetiChatHistoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<ChatSession | null>(null);
  const [newTitle, setNewTitle] = useState("");
  
  const { 
    sessions, 
    loadSessions, 
    deleteSession, 
    updateSessionTitle,
    isLoading 
  } = useYetiChatMemory();
  
  const { toast } = useToast();

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteSession(sessionId);
  };

  const handleEditTitle = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSession(session);
    setNewTitle(session.title);
    setIsEditDialogOpen(true);
  };

  const handleSaveTitle = async () => {
    if (editingSession && newTitle.trim()) {
      await updateSessionTitle(editingSession.id, newTitle.trim());
      setIsEditDialogOpen(false);
      setEditingSession(null);
      setNewTitle("");
    }
  };

  const groupSessionsByDate = (sessions: ChatSession[]) => {
    const groups: { [key: string]: ChatSession[] } = {};
    
    sessions.forEach(session => {
      const date = new Date(session.updated_at);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const oneWeekAgo = new Date(today);
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      let groupKey: string;
      if (date.toDateString() === today.toDateString()) {
        groupKey = "Today";
      } else if (date.toDateString() === yesterday.toDateString()) {
        groupKey = "Yesterday";
      } else if (date > oneWeekAgo) {
        groupKey = "This Week";
      } else {
        groupKey = "Older";
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(session);
    });
    
    return groups;
  };

  const sessionGroups = groupSessionsByDate(filteredSessions);
  const groupOrder = ["Today", "Yesterday", "This Week", "Older"];

  return (
    <div className={`flex flex-col h-full bg-gray-50 border-r ${className}`}>
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <History className="h-5 w-5 text-blue-600" />
            Chat Memory
          </h2>
          <Button size="sm" onClick={onNewSession} className="gap-2">
            <Plus className="h-4 w-4" />
            New
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Sessions List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Loading chat history...</div>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <MessageSquare className="h-12 w-12 mb-2 opacity-50" />
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs">Start a new chat to begin</p>
            </div>
          ) : (
            groupOrder.map(groupKey => {
              const groupSessions = sessionGroups[groupKey];
              if (!groupSessions?.length) return null;
              
              return (
                <div key={groupKey} className="mb-6">
                  <div className="flex items-center gap-2 px-2 py-1 mb-2">
                    <Calendar className="h-3 w-3 text-gray-400" />
                    <span className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                      {groupKey}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    {groupSessions.map((session) => (
                      <div
                        key={session.id}
                        onClick={() => onSessionSelect(session.id)}
                        className={`
                          group relative p-3 rounded-lg cursor-pointer transition-all
                          hover:bg-white hover:shadow-sm border border-transparent
                          ${currentSessionId === session.id 
                            ? 'bg-white shadow-sm border-blue-200 ring-1 ring-blue-200' 
                            : 'hover:border-gray-200'
                          }
                        `}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-sm font-medium text-gray-900 truncate">
                                {session.title}
                              </h3>
                              <Badge variant="outline" className="text-xs">
                                {session.model_used.split('-').pop()}
                              </Badge>
                            </div>
                            
                            <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                              {session.preview}
                            </p>
                            
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                {session.message_count}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDistanceToNow(new Date(session.updated_at), { addSuffix: true })}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => handleEditTitle(session, e)}
                              className="h-6 w-6 p-0"
                            >
                              <Edit3 className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => handleDeleteSession(session.id, e)}
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Edit Title Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Session Title</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Enter new title..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSaveTitle();
                }
              }}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveTitle} disabled={!newTitle.trim()}>
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}