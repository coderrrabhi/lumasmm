import { cn } from "@/lib/utils";
import { platformOptions } from '@/lib/platform-options';
import { Button } from '@/components/ui/button';
import { PlatformIcon } from '@/components/PlatformIcon';

interface PlatformSelectorProps {
  selected: string;
  onSelect: (platform: string) => void;
  availablePlatforms?: string[]; // Only show platforms with active bundles
}

export function PlatformSelector({ selected, onSelect, availablePlatforms }: PlatformSelectorProps) {
  // Filter platforms based on availablePlatforms prop
  const platformsToShow = platformOptions(availablePlatforms || [])
    .filter(option => !availablePlatforms || availablePlatforms.includes(option.key));

  if (platformsToShow.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No platforms configured. Contact admin to set up engagement bundles.
      </div>
    );
  }

  return (
    <div className="luma-platform-grid">
      {platformsToShow.map(({key, label}) => {
        const isSelected = selected === key;

        return (
          <Button
            variant="ghost"
            key={key}
            aria-pressed={isSelected}
            onClick={() => onSelect(key)}
            className={cn(
              "group relative flex flex-col items-center justify-center gap-2 h-20 px-3 rounded-lg font-semibold text-sm",
              isSelected
                ? 'bg-secondary text-primary hover:bg-secondary hover:text-primary border border-primary'
                : "bg-secondary/60 text-muted-foreground border border-border/60 hover:text-foreground hover:border-border"
            )}
          >
            <PlatformIcon platform={key} />
            <span>{label}</span>
            {isSelected && (
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
            )}
          </Button>
        );
      })}
    </div>
  );
}
