import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useConsent, safeLocalStorage } from "@/hooks/useConsent";
import { Contrast } from "lucide-react";

const HIGH_CONTRAST_KEY = "highContrastMode";

export function HighContrastToggle() {
  const { t } = useTranslation();
  const { hasConsent } = useConsent();
  const storage = safeLocalStorage(hasConsent);

  const [isHighContrast, setIsHighContrast] = useState<boolean>(() => {
    const stored = storage.getItem(HIGH_CONTRAST_KEY);
    return stored === "true";
  });

  const [announcement, setAnnouncement] = useState<string>("");

  useEffect(() => {
    if (isHighContrast) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }
  }, [isHighContrast]);

  const toggleHighContrast = () => {
    const newValue = !isHighContrast;
    setIsHighContrast(newValue);
    storage.setItem(HIGH_CONTRAST_KEY, String(newValue));
    
    const message = newValue 
      ? t("accessibility.highContrast.enabled")
      : t("accessibility.highContrast.disabled");
    
    setAnnouncement(message);
    setTimeout(() => setAnnouncement(""), 1000);
  };

  return (
    <>
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleHighContrast}
        aria-label={t("accessibility.highContrast.toggle")}
        aria-pressed={isHighContrast}
        data-testid="button-high-contrast-toggle"
        title={t("accessibility.highContrast.toggle")}
      >
        <Contrast className={isHighContrast ? "w-5 h-5" : "w-5 h-5"} />
      </Button>
    </>
  );
}
