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
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useTranslation } from "react-i18next";
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

function SkipLinks() {
  const { t } = useTranslation();
  
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg"
        data-testid="link-skip-main"
      >
        {t("accessibility.skipLinks.skipToMainContent")}
      </a>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ConsentProvider>
          <TooltipProvider>
            <SkipLinks />
            <ConsentBanner />
            <Toaster />
            <Router />
          </TooltipProvider>
        </ConsentProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
