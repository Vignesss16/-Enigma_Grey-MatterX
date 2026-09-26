"use client";

import { MobileHeader } from "@/components/navigation/MobileHeader";
import { ProfileForm } from "@/components/profile/ProfileForm";

export default function ProfilePage() {
  return (
    <>
      <MobileHeader title="Health Profile" showBack />

      <div className="px-gutter lg:px-space-xl py-space-sm max-w-4xl mx-auto flex flex-col gap-space-md">
        <div className="pb-space-xs border-b border-outline-variant/15">
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">
            Personal Health Profile
          </h1>
          <p className="text-xs text-on-surface-variant">
            Manage your clinical baselines, chronic conditions, and personal safety thresholds.
          </p>
        </div>

        <ProfileForm />
      </div>
    </>
  );
}
