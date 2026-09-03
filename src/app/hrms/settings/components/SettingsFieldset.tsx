import * as React from "react";

export function SettingsFieldset({
  canEdit,
  children,
}: {
  canEdit: boolean;
  children: React.ReactNode;
}) {
  return (
    <fieldset disabled={!canEdit} className="contents">
      {children}
    </fieldset>
  );
}
