import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import * as React from "react";
import type { FieldErrors, FieldValues } from "react-hook-form";

export interface SettingsTab {
  value: string;
  label: string;
  fields: string[];
  content: React.ReactNode;
}

export function useSettingsTabs(tabs: SettingsTab[]) {
  const [tab, setTab] = React.useState(tabs[0]?.value ?? "");

  const showFirstError = React.useCallback(
    (errors: FieldErrors<FieldValues>) => {
      const failed = Object.keys(errors);
      const match = tabs.find((entry) => entry.fields.some((field) => failed.includes(field)));
      if (match) setTab(match.value);
    },
    [tabs]
  );

  return { tab, setTab, showFirstError };
}

export function SettingsTabs({
  tabs,
  value,
  onValueChange,
}: {
  tabs: SettingsTab[];
  value: string;
  onValueChange: (value: string) => void;
}) {
  return (
    <Tabs value={value} onValueChange={onValueChange} className="gap-4">
      <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 sm:w-fit">
        {tabs.map((entry) => (
          <TabsTrigger key={entry.value} value={entry.value} className="flex-none">
            {entry.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map((entry) => (
        <TabsContent
          key={entry.value}
          value={entry.value}
          forceMount
          className="space-y-4 data-[state=inactive]:hidden"
        >
          {entry.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
