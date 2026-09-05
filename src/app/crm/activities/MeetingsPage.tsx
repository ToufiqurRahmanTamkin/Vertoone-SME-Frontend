import { ActivityListPage } from "./components/ActivityListPage";

export default function CrmMeetingsPage() {
  return (
    <ActivityListPage
      category="MEETING"
      modulePath="/crm/activities/meetings"
      title="Meetings"
      description="Meetings, demos and site visits booked with a customer, and the notes they produced."
      createLabel="Log a meeting"
      emptyHint="No meetings yet. Book or record one against a deal, lead or contact."
      statLabels={{ total: "Meetings", open: "Upcoming", overdue: "Overdue", done: "Held" }}
    />
  );
}
