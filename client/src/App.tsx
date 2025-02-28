import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Chat from "@/pages/chat";
import Auth from "@/pages/auth";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Auth} />
      <Route path="/chat" component={Chat} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import { Toaster } from "./components/ui/toaster";
// Import your other components here

function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <Routes>
        {/* Your existing routes */}
      </Routes>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
