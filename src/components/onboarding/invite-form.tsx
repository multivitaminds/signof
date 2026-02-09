"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";

interface InviteRow {
  id: number;
  name: string;
  email: string;
  role: string;
}

const roleOptions = [
  { value: "admin", label: "Admin" },
  { value: "member", label: "Member" },
];

let nextId = 1;

function createRow(): InviteRow {
  return { id: nextId++, name: "", email: "", role: "member" };
}

export default function InviteForm() {
  const [rows, setRows] = useState<InviteRow[]>([createRow()]);

  function addRow() {
    setRows((prev) => [...prev, createRow()]);
  }

  function removeRow(id: number) {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  function updateRow(id: number, field: keyof InviteRow, value: string) {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  }

  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <div key={row.id} className="flex items-end gap-3">
          <div className="flex-1">
            <Input
              placeholder="Name"
              value={row.name}
              onChange={(e) => updateRow(row.id, "name", e.target.value)}
            />
          </div>
          <div className="flex-1">
            <Input
              placeholder="Email"
              type="email"
              value={row.email}
              onChange={(e) => updateRow(row.id, "email", e.target.value)}
            />
          </div>
          <div className="w-32">
            <Select
              options={roleOptions}
              value={row.role}
              onChange={(e) => updateRow(row.id, "role", e.target.value)}
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeRow(row.id)}
            disabled={rows.length === 1}
            aria-label="Remove row"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}

      <Button variant="ghost" size="sm" onClick={addRow}>
        <Plus className="h-4 w-4" />
        Add another
      </Button>
    </div>
  );
}
