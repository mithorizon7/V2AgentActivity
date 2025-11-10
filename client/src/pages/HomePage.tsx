import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConsentManager } from "@/components/ConsentManager";
import { HighContrastToggle } from "@/components/HighContrastToggle";
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
        <HighContrastToggle />
      </div>
      <div id="main-content" className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <img src={ProgramLogo} alt="AI Agents Learning Platform Logo" className="w-20 h-20" />
            <h1 className="text-4xl font-bold">{t("homePage.title")}</h1>
            <img src={ProgramLogo} alt="AI Agents Learning Platform Logo" className="w-20 h-20 scale-x-[-1]" />
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("homePage.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 space-y-3 hover-elevate transition-all">
            <div className="w-16 h-16 flex items-center justify-center">
              <img src={UnderstandIcon} alt="Understand" className="w-full h-full object-contain" />
            </div>
            <h3 className="font-semibold text-lg">{t("homePage.understand.title")}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("homePage.understand.description")}
            </p>
          </Card>

          <Card className="p-6 space-y-3 hover-elevate transition-all">
            <div className="w-16 h-16 flex items-center justify-center">
              <img src={PracticeIcon} alt="Practice" className="w-full h-full object-contain" />
            </div>
            <h3 className="font-semibold text-lg">{t("homePage.practice.title")}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("homePage.practice.description")}
            </p>
          </Card>

          <Card className="p-6 space-y-3 hover-elevate transition-all">
            <div className="w-16 h-16 flex items-center justify-center">
              <img src={BuildIcon} alt="Build" className="w-full h-full object-contain" />
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

        <div className="mt-12 flex justify-center">
          <img src={MITOpenLearningLogo} alt="MIT Open Learning" className="h-12 opacity-80" />
        </div>

        <div className="mt-6 flex justify-center">
          <ConsentManager />
        </div>
      </div>
    </div>
  );
}
