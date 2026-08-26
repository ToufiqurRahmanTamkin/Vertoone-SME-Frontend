import { PwaLifecycle } from "@/components/pwa/pwa-lifecycle";
import { AppRouter } from "@/components/router/app-router";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarConfigProvider } from "@/contexts/sidebar-context";
import { BrowserRouter as Router } from "react-router-dom";

const basename = import.meta.env.VITE_BASENAME || "";

function App() {
  return (
    <div className="font-sans antialiased" style={{ fontFamily: "var(--font-inter)" }}>
      <ThemeProvider defaultTheme="light">
        <SidebarConfigProvider>
          <Router basename={basename}>
            <AppRouter />
          </Router>
          <PwaLifecycle />
        </SidebarConfigProvider>
      </ThemeProvider>
    </div>
  );
}

export default App;
