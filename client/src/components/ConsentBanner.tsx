import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, Save, X } from "lucide-react";
import { useConsent } from "@/hooks/useConsent";

interface ConsentBannerProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function ConsentBanner({ isOpen, onClose }: ConsentBannerProps = {}) {
  const { t } = useTranslation();
  const { consentStatus, grantConsent, denyConsent } = useConsent();

  // If explicitly controlled via props, use that; otherwise check consent status
  const shouldShow = isOpen !== undefined ? isOpen : consentStatus === 'pending';

  if (!shouldShow) {
    return null;
  }

  const handleGrant = () => {
    grantConsent();
    onClose?.();
  };

  const handleDeny = () => {
    denyConsent();
    onClose?.();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      data-testid="consent-banner-overlay"
    >
      <Card className="max-w-lg w-full p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-2">
              {t("consent.title")}
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              {t("consent.description")}
            </p>
            
            <div className="bg-muted/50 rounded-lg p-3 mb-4 space-y-2">
              <div className="flex items-start gap-2">
                <Save className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">{t("consent.whatWeStore")}</p>
                  <ul className="list-disc list-inside text-muted-foreground mt-1 space-y-1">
                    <li>{t("consent.storeItem1")}</li>
                    <li>{t("consent.storeItem2")}</li>
                    <li>{t("consent.storeItem3")}</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <X className="w-4 h-4 inline mr-1" />
                {t("consent.noPersonalData")}
              </p>
            </div>

            <p className="text-xs text-muted-foreground mb-4">
              {t("consent.yourChoice")}
            </p>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={handleDeny}
            data-testid="button-deny-consent"
          >
            {t("consent.noThanks")}
          </Button>
          <Button
            onClick={handleGrant}
            data-testid="button-grant-consent"
          >
            {t("consent.saveProgress")}
          </Button>
        </div>
      </Card>
    </div>
  );
}
