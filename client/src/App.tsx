import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import HomePage from "@/pages/HomePage";
import LearningPage from "@/pages/LearningPage";
import NotFound from "@/pages/not-found";
import { ConsentBanner } from "@/components/ConsentBanner";
import { ConsentProvider } from "@/contexts/ConsentContext";
import "./lib/i18n";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/learn" component={LearningPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConsentProvider>
        <TooltipProvider>
          <ConsentBanner />
          <Toaster />
          <Router />
        </TooltipProvider>
      </ConsentProvider>
    </QueryClientProvider>
  );
}

export default App;
