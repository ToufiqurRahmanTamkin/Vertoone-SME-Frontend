import { ActivityListPage } from "./components/ActivityListPage";

export default function CrmNotesPage() {
  return (
    <ActivityListPage
      category="NOTE"
      modulePath="/crm/activities/notes"
      title="Notes"
      description="Free-form notes pinned to a deal, lead or contact so the next person has the context."
      createLabel="New note"
      emptyHint="No notes yet. Write down what you learned on the last conversation."
      showDue={false}
      statLabels={{ total: "Notes", open: "Open", overdue: "Overdue", done: "Filed" }}
    />
  );
}
