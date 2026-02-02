import { Component, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import i18n from "@/lib/i18n";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      const t = (key: string) => i18n.t(key);

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center gap-2">
              <div className="flex justify-center mb-2">
                <AlertCircle className="w-12 h-12 text-destructive" aria-hidden="true" />
              </div>
              <CardTitle className="text-2xl">{t("errorBoundary.title")}</CardTitle>
              <CardDescription className="text-base">
                {t("errorBoundary.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {import.meta.env.DEV && this.state.error && (
                <details className="text-sm">
                  <summary className="cursor-pointer font-semibold mb-2 text-muted-foreground">
                    {t("errorBoundary.technicalDetails")}
                  </summary>
                  <pre className="mt-2 p-4 bg-muted rounded-md overflow-auto text-xs">
                    <code>
                      {this.state.error.toString()}
                      {this.state.errorInfo?.componentStack}
                    </code>
                  </pre>
                </details>
              )}
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={this.handleReset}
                data-testid="button-error-home"
              >
                {t("errorBoundary.returnHome")}
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.reload()}
                data-testid="button-error-reload"
              >
                {t("errorBoundary.retry")}
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
