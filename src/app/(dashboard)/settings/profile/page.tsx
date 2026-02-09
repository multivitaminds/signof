"use client";

import { useState } from "react";
import Avatar from "@/components/ui/avatar";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { currentUser } from "@/lib/mock-data";

export default function ProfilePage() {
  const [name, setName] = useState(currentUser.name);
  const [jobTitle, setJobTitle] = useState(currentUser.jobTitle ?? "");
  const [company, setCompany] = useState(currentUser.company ?? "");

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-6">
            <Avatar name={currentUser.name} size="lg" className="h-16 w-16 text-xl" />
            <div>
              <p className="text-sm font-medium text-foreground">{currentUser.name}</p>
              <p className="text-xs text-muted-foreground">{currentUser.email}</p>
              <Button variant="ghost" size="sm" className="mt-1 px-0 text-accent">
                Change photo
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <Input
              label="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              label="Email"
              value={currentUser.email}
              disabled
            />
            <Input
              label="Job title"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />
            <Input
              label="Company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button>Save changes</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
