import Button from "@/components/ui/button";
import { Plus, Send, Calendar } from "lucide-react";

export default function QuickActions() {
  return (
    <div className="flex flex-wrap gap-3">
      <Button variant="secondary">
        <Plus className="h-4 w-4" />
        New Agreement
      </Button>
      <Button variant="secondary">
        <Send className="h-4 w-4" />
        Send for Signature
      </Button>
      <Button variant="secondary">
        <Calendar className="h-4 w-4" />
        Schedule Meeting
      </Button>
    </div>
  );
}
