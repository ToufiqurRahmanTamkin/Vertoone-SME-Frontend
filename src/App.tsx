import { BrowserRouter } from "react-router-dom";
import { AppRouter } from "@/components/router/app-router";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
      <Toaster position="top-right" richColors toastOptions={{ duration: 5000 }} />
    </ThemeProvider>
  );
}
