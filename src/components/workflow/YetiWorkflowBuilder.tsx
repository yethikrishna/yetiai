
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GitBranch, Play, Settings, Zap, MessageCircle, Send, Database, Filter } from "lucide-react";

export function WorkflowBuilder() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  
  const workflowNodes = [
    { id: "trigger", type: "trigger", name: "Webhook Trigger", x: 100, y: 100, icon: Zap },
    { id: "ai", type: "action", name: "Yeti AI Process", x: 300, y: 100, icon: MessageCircle },
    { id: "filter", type: "condition", name: "Content Filter", x: 500, y: 100, icon: Filter },
    { id: "send", type: "action", name: "Send Response", x: 700, y: 100, icon: Send },
    { id: "store", type: "action", name: "Store Data", x: 500, y: 250, icon: Database }
  ];

  const nodeTypes = [
    { type: "trigger", name: "Triggers", items: ["Webhook", "Schedule", "Email", "Chat Message"] },
    { type: "action", name: "Actions", items: ["Yeti AI", "Send Email", "Post to Social", "Store Data"] },
    { type: "condition", name: "Conditions", items: ["Content Filter", "User Permission", "Time Check"] }
  ];

  return (
    <div className="grid grid-cols-4 gap-6 h-[600px]">
      {/* Node Palette */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">Workflow Nodes</h3>
        {nodeTypes.map((category) => (
          <Card key={category.type}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{category.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {category.items.map((item) => (
                <Button
                  key={item}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs"
                  draggable
                >
                  {item}
                </Button>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Canvas */}
      <div className="col-span-2 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 relative overflow-hidden">
        <div className="absolute inset-0 p-4">
          <div className="text-center text-gray-500 mt-20">
            <GitBranch className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">🧊 Yeti Workflow Canvas</p>
            <p className="text-sm">Drag nodes from the left to build your workflow</p>
          </div>
          
          {/* Workflow Nodes */}
          {workflowNodes.map((node) => (
            <div
              key={node.id}
              className={`absolute w-32 p-3 bg-white rounded-lg border-2 cursor-pointer transition-all ${
                selectedNode === node.id ? 'border-blue-500 shadow-lg' : 'border-gray-200 hover:border-gray-300'
              }`}
              style={{ left: `${node.x}px`, top: `${node.y}px` }}
              onClick={() => setSelectedNode(node.id)}
            >
              <div className="flex items-center gap-2 mb-2">
                <node.icon className="h-4 w-4" />
                <Badge variant={node.type === 'trigger' ? 'default' : node.type === 'condition' ? 'secondary' : 'outline'} className="text-xs">
                  {node.type}
                </Badge>
              </div>
              <p className="text-xs font-medium">{node.name}</p>
            </div>
          ))}

          {/* Connection Lines */}
          <svg className="absolute inset-0 pointer-events-none">
            <line x1="232" y1="116" x2="268" y2="116" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrowhead)" />
            <line x1="432" y1="116" x2="468" y2="116" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrowhead)" />
            <line x1="632" y1="116" x2="668" y2="116" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrowhead)" />
            <line x1="566" y1="132" x2="566" y2="218" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrowhead)" />
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
              </marker>
            </defs>
          </svg>
        </div>
      </div>

      {/* Properties Panel */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">Node Properties</h3>
        {selectedNode ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                {workflowNodes.find(n => n.id === selectedNode)?.name}
              </CardTitle>
              <CardDescription className="text-xs">Configure this node</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <label className="text-xs font-medium">Name</label>
                <input className="w-full text-xs p-2 border rounded" defaultValue={workflowNodes.find(n => n.id === selectedNode)?.name} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">Description</label>
                <textarea className="w-full text-xs p-2 border rounded h-16" placeholder="Enter description..." />
              </div>
              <Button size="sm" className="w-full">
                <Settings className="h-3 w-3 mr-1" />
                Configure
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <Settings className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500">Select a node to configure</p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-2">
          <Button size="sm" className="w-full">
            <Play className="h-3 w-3 mr-1" />
            Test Workflow
          </Button>
          <Button size="sm" variant="outline" className="w-full">
            Save Draft
          </Button>
        </div>
      </div>
    </div>
  );
}
