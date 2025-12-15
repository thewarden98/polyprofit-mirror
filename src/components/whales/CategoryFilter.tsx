import { cn } from "@/lib/utils";
import { WhaleCategory } from "@/types";

interface CategoryFilterProps {
  selected: WhaleCategory | "all";
  onChange: (category: WhaleCategory | "all") => void;
}

const categories: { value: WhaleCategory | "all"; label: string; emoji: string }[] = [
  { value: "all", label: "All", emoji: "🌐" },
  { value: "politics", label: "Politics", emoji: "🏛️" },
  { value: "crypto", label: "Crypto", emoji: "₿" },
  { value: "sports", label: "Sports", emoji: "⚽" },
  { value: "entertainment", label: "Entertainment", emoji: "🎬" },
];

export function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((category) => (
        <button
          key={category.value}
          onClick={() => onChange(category.value)}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
            selected === category.value
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
          )}
        >
          <span>{category.emoji}</span>
          <span>{category.label}</span>
        </button>
      ))}
    </div>
  );
}
