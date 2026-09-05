import { ActivityListPage } from "./components/ActivityListPage";

export default function CrmTasksPage() {
  return (
    <ActivityListPage
      category="TASK"
      modulePath="/crm/activities/tasks"
      title="Tasks"
      description="Follow-ups owed on a lead, deal or contact, and who owes them."
      createLabel="New task"
      emptyHint="No tasks yet. Add one against the deal or lead you need to chase."
      statLabels={{ total: "Tasks", open: "Open", overdue: "Overdue", done: "Completed" }}
    />
  );
}
