"use client";

interface RundownDisplayProps {
  readonly rundown?: string | null;
  readonly className?: string;
}

export function RundownDisplay({ rundown, className }: RundownDisplayProps) {
  if (!rundown || rundown.trim() === "") {
    return (
      <p className={`text-sm text-muted-foreground ${className ?? ""}`}>
        No rundown available
      </p>
    );
  }

  // Split by newlines and render each line
  const lines = rundown.split("\n").filter((line) => line.trim() !== "");

  if (lines.length === 0) {
    return (
      <p className={`text-sm text-muted-foreground ${className ?? ""}`}>
        No rundown available
      </p>
    );
  }

  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      {lines.map((line, index) => (
        <p key={index} className="text-sm leading-relaxed">
          {line.trim()}
        </p>
      ))}
    </div>
  );
}


