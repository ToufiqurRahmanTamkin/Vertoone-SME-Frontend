import { ActivityListPage } from "./components/ActivityListPage";

export default function CrmCallsPage() {
  return (
    <ActivityListPage
      category="CALL"
      modulePath="/crm/activities/calls"
      title="Calls"
      description="Calls made and received, how they went and what was agreed."
      createLabel="Log a call"
      emptyHint="No calls logged yet. Record the next one against its deal, lead or contact."
      statLabels={{ total: "Calls", open: "Scheduled", overdue: "Overdue", done: "Made" }}
    />
  );
}
