import { Component, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

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
      let locale = "en";
      try {
        locale = localStorage.getItem("i18nextLng") || "en";
      } catch (e) {
        // Fallback to English if localStorage unavailable or consent denied
      }
      
      const translations = {
        en: {
          title: "Something went wrong",
          description: "We apologize for the inconvenience. An unexpected error occurred while loading the application.",
          technicalDetails: "Technical details",
          returnHome: "Return to Home",
          retry: "Reload Page"
        },
        ru: {
          title: "Что-то пошло не так",
          description: "Приносим извинения за неудобства. Произошла непредвиденная ошибка при загрузке приложения.",
          technicalDetails: "Технические детали",
          returnHome: "Вернуться на главную",
          retry: "Перезагрузить страницу"
        },
        lv: {
          title: "Radās kļūda",
          description: "Atvainojamies par sagādātajām neērtībām. Ielādējot lietotni, radās neparedzēta kļūda.",
          technicalDetails: "Tehniskie dati",
          returnHome: "Atgriezties uz sākumu",
          retry: "Pārlādēt lapu"
        }
      };

      const t = translations[locale as keyof typeof translations] || translations.en;

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center gap-2">
              <div className="flex justify-center mb-2">
                <AlertCircle className="w-12 h-12 text-destructive" aria-hidden="true" />
              </div>
              <CardTitle className="text-2xl">{t.title}</CardTitle>
              <CardDescription className="text-base">
                {t.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {import.meta.env.DEV && this.state.error && (
                <details className="text-sm">
                  <summary className="cursor-pointer font-semibold mb-2 text-muted-foreground">
                    {t.technicalDetails}
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
                {t.returnHome}
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.reload()}
                data-testid="button-error-reload"
              >
                {t.retry}
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
