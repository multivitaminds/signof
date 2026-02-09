"use client";

import { useState } from "react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? "bg-accent" : "bg-neutral-200 dark:bg-neutral-700"}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? "translate-x-6" : "translate-x-1"}`}
      />
    </button>
  );
}

export default function AccountPage() {
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [inAppNotifs, setInAppNotifs] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  return (
    <div className="max-w-2xl space-y-6">
      {/* Change Password */}
      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold text-foreground">Change Password</h2>
          <p className="text-sm text-muted-foreground">Update your password to keep your account secure.</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input label="Current password" type="password" placeholder="Enter current password" />
            <Input label="New password" type="password" placeholder="Enter new password" />
            <Input label="Confirm new password" type="password" placeholder="Confirm new password" />
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button>Update password</Button>
        </CardFooter>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold text-foreground">Notifications</h2>
          <p className="text-sm text-muted-foreground">Choose how you want to be notified.</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Email notifications</p>
                <p className="text-xs text-muted-foreground">Receive updates via email</p>
              </div>
              <Toggle enabled={emailNotifs} onToggle={() => setEmailNotifs(!emailNotifs)} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">In-app notifications</p>
                <p className="text-xs text-muted-foreground">Show notifications within the app</p>
              </div>
              <Toggle enabled={inAppNotifs} onToggle={() => setInAppNotifs(!inAppNotifs)} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Weekly digest</p>
                <p className="text-xs text-muted-foreground">Get a weekly summary of activity</p>
              </div>
              <Toggle enabled={weeklyDigest} onToggle={() => setWeeklyDigest(!weeklyDigest)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 dark:border-red-900">
        <CardHeader>
          <h2 className="text-base font-semibold text-red-600 dark:text-red-400">Danger Zone</h2>
          <p className="text-sm text-muted-foreground">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
        </CardHeader>
        <CardContent>
          <Button variant="destructive">Delete Account</Button>
        </CardContent>
      </Card>
    </div>
  );
}
