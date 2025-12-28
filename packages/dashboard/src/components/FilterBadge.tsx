interface FilterBadgeProps {
  name: string;
  value: any;
}

export function FilterBadge({ name, value }: FilterBadgeProps) {
  const displayValue =
    typeof value === "object" ? JSON.stringify(value) : String(value);

  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
      <span className="font-semibold">{name}:</span>
      <span className="ml-1">{displayValue}</span>
    </span>
  );
}

