import { RequestListPage } from "./components/RequestListPage";
import { REQUEST_KIND_CONFIG } from "./components/requestKinds";

export default function MyOvertimePage() {
  return <RequestListPage config={REQUEST_KIND_CONFIG.OVERTIME} />;
}
