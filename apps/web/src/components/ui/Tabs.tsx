import type { ReactNode } from "react";

import { cn } from "./utils";

export type TabItem = {
  content: ReactNode;
  label: ReactNode;
  value: string;
};

export type TabsProps = {
  className?: string;
  onValueChange: (value: string) => void;
  tabs: TabItem[];
  value: string;
};

export function Tabs({ className, onValueChange, tabs, value }: TabsProps) {
  const activeTab = tabs.find((tab) => tab.value === value) ?? tabs[0];

  return (
    <div className={className}>
      <div aria-label="Section tabs" className="flex gap-1 border-b border-border" role="tablist">
        {tabs.map((tab) => {
          const selected = tab.value === activeTab.value;

          return (
            <button
              aria-selected={selected}
              className={cn(
                "border-b-2 px-3 py-2 text-sm font-medium transition-colors",
                selected
                  ? "border-primary text-text-primary"
                  : "border-transparent text-text-muted hover:text-text-primary",
              )}
              key={tab.value}
              onClick={() => onValueChange(tab.value)}
              role="tab"
              type="button"
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div className="pt-4" role="tabpanel">
        {activeTab.content}
      </div>
    </div>
  );
}
