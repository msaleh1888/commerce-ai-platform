import { useId, useRef, type KeyboardEvent, type ReactNode } from "react";

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
  const tabIdPrefix = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeIndex = Math.max(0, tabs.findIndex((tab) => tab.value === value));
  const activeTab = tabs[activeIndex];
  const panelId = `${tabIdPrefix}-panel`;

  if (!activeTab) {
    return null;
  }

  const selectTab = (index: number) => {
    const nextIndex = (index + tabs.length) % tabs.length;
    onValueChange(tabs[nextIndex].value);
    tabRefs.current[nextIndex]?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      selectTab(index + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      selectTab(index - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      selectTab(0);
    } else if (event.key === "End") {
      event.preventDefault();
      selectTab(tabs.length - 1);
    }
  };

  return (
    <div className={className}>
      <div aria-label="Section tabs" className="flex gap-1 border-b border-border" role="tablist">
        {tabs.map((tab, index) => {
          const selected = index === activeIndex;
          const tabId = `${tabIdPrefix}-tab-${index}`;

          return (
            <button
              aria-selected={selected}
              aria-controls={panelId}
              className={cn(
                "border-b-2 px-3 py-2 text-sm font-medium transition-colors",
                selected
                  ? "border-primary text-text-primary"
                  : "border-transparent text-text-muted hover:text-text-primary",
              )}
              key={tab.value}
              id={tabId}
              onKeyDown={(event) => handleKeyDown(event, index)}
              onClick={() => onValueChange(tab.value)}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              role="tab"
              tabIndex={selected ? 0 : -1}
              type="button"
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div aria-labelledby={`${tabIdPrefix}-tab-${activeIndex}`} className="pt-4" id={panelId} role="tabpanel">
        {activeTab.content}
      </div>
    </div>
  );
}
