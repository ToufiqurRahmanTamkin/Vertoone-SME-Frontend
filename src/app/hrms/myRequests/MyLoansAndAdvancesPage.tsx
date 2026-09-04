import { RequestListPage } from "./components/RequestListPage";
import { REQUEST_KIND_CONFIG } from "./components/requestKinds";

export default function MyLoansAndAdvancesPage() {
  return <RequestListPage config={REQUEST_KIND_CONFIG.LOAN_ADVANCE} />;
}
