import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home } from "lucide-react";

export default function NotFound() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6 space-y-4">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <h1 className="text-2xl font-bold">{t("notFound.title")}</h1>
          </div>

          <p className="text-sm text-muted-foreground">
            {t("notFound.message")}
          </p>

          <Button 
            onClick={() => setLocation("/")}
            data-testid="button-go-home"
            className="w-full"
          >
            <Home className="w-4 h-4 mr-2" />
            {t("navigation.goHome")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
