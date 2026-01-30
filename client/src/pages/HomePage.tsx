import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConsentManager } from "@/components/ConsentManager";
import { HighContrastToggle } from "@/components/HighContrastToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import { ArrowRight } from "lucide-react";
import ProgramLogo from "@assets/LogoRealv2_1762811142025.png";
import UnderstandIcon from "@assets/Understand_1762809751241.png";
import PracticeIcon from "@assets/Practice_1762809751241.png";
import BuildIcon from "@assets/Build_1762809751241.png";
import MITOpenLearningLogo from "@assets/Open-Learning-logo-revised copy_1762811060793.png";

export default function HomePage() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <LanguageSelector />
        <HighContrastToggle />
      </div>
      <div id="main-content" className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <img src={ProgramLogo} alt={t("accessibility.images.platformLogo")} className="w-20 h-20" />
            <h1 className="text-4xl font-bold">{t("homePage.title")}</h1>
            <img src={ProgramLogo} alt={t("accessibility.images.platformLogo")} className="w-20 h-20 scale-x-[-1]" />
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("homePage.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 space-y-3">
            <div className="w-16 h-16 flex items-center justify-center">
              <img src={UnderstandIcon} alt={t("accessibility.images.understandIcon")} className="w-full h-full object-contain" />
            </div>
            <h3 className="font-semibold text-lg">{t("homePage.understand.title")}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("homePage.understand.description")}
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <div className="w-16 h-16 flex items-center justify-center">
              <img src={PracticeIcon} alt={t("accessibility.images.practiceIcon")} className="w-full h-full object-contain" />
            </div>
            <h3 className="font-semibold text-lg">{t("homePage.practice.title")}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("homePage.practice.description")}
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <div className="w-16 h-16 flex items-center justify-center">
              <img src={BuildIcon} alt={t("accessibility.images.buildIcon")} className="w-full h-full object-contain" />
            </div>
            <h3 className="font-semibold text-lg">{t("homePage.build.title")}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("homePage.build.description")}
            </p>
          </Card>
        </div>

        <Card className="p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold">{t("homePage.ready.title")}</h2>
                <Badge variant="secondary">{t("homePage.ready.badge")}</Badge>
              </div>
              <p className="text-muted-foreground">
                {t("homePage.ready.description")}
              </p>
            </div>
            <Button
              size="lg"
              onClick={() => setLocation("/learn")}
              className="px-8"
              data-testid="button-start-learning"
            >
              {t("homePage.ready.startButton")}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </Card>

        <footer className="mt-16 pt-6 border-t border-border/40 relative">
          <div className="flex flex-col items-center gap-4">
            <img src={MITOpenLearningLogo} alt={t("accessibility.images.mitOpenLearning")} className="h-10 opacity-80" />
            <div className="flex items-center gap-3">
              <a 
                href="https://accessibility.mit.edu" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline transition-colors"
                data-testid="link-accessibility"
              >
                {t("footer.accessibilityLink")}
              </a>
              <span className="text-muted-foreground/30">|</span>
              <ConsentManager />
            </div>
          </div>
          
          <p className="absolute bottom-0 right-0 text-[10px] text-muted-foreground/60 text-right leading-tight">
            {t("footer.copyright")} {t("footer.orgName")}<br />
            {t("footer.institution")}, {t("footer.location")}
          </p>
        </footer>
      </div>
    </div>
  );
}
