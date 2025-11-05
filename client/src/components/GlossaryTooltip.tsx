import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { AgentProcess } from "@shared/schema";
import { getProcessColor } from "@/lib/processColors";
import { HelpCircle } from "lucide-react";

type GlossaryTooltipProps = {
  term: string;
  definition: string;
  process: AgentProcess;
  example?: string;
  children?: React.ReactNode;
};

export function GlossaryTooltip({
  term,
  definition,
  process,
  example,
  children,
}: GlossaryTooltipProps) {
  const colors = getProcessColor(process);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {children || (
          <button
            className="inline-flex items-center gap-1 underline decoration-dotted hover:text-primary transition-colors"
            data-testid={`glossary-term-${term.toLowerCase().replace(/\s+/g, "-")}`}
          >
            {term}
            <HelpCircle className="w-3 h-3" />
          </button>
        )}
      </TooltipTrigger>
      <TooltipContent className="max-w-xs p-4 space-y-2" side="top">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-sm">{term}</h4>
          <Badge
            className={`${colors.bg} ${colors.text} text-xs flex-shrink-0`}
            variant="secondary"
            data-testid={`process-badge-${process}`}
          >
            {process.charAt(0).toUpperCase() + process.slice(1)}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{definition}</p>
        {example && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground italic">
              Example: {example}
            </p>
          </div>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
