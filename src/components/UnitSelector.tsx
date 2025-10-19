import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface UnitSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export const UnitSelector = ({ value, onChange, label = "Unit" }: UnitSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="hectares">Hectares (ha)</SelectItem>
          <SelectItem value="acres">Acres</SelectItem>
          <SelectItem value="square_meters">Square Meters (m²)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export const convertToHectares = (value: number, unit: string): number => {
  switch (unit) {
    case "acres":
      return value * 0.404686;
    case "square_meters":
      return value / 10000;
    case "hectares":
    default:
      return value;
  }
};