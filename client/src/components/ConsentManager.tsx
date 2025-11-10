import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ConsentBanner } from "@/components/ConsentBanner";
import { Settings } from "lucide-react";

export function ConsentManager() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="text-xs text-muted-foreground hover:text-foreground"
        data-testid="button-manage-consent"
      >
        <Settings className="w-3 h-3 mr-1" />
        {t("consent.managePreferences")}
      </Button>
      
      <ConsentBanner
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
