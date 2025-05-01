
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

type ConditionFilterProps = {
  selectedConditions: string[];
  onChange: (conditions: string[]) => void;
};

const conditions = [
  "New",
  "Open box",
  "Manufacturer refurbished",
  "Seller refurbished",
  "Used",
  "For parts or not working"
];

const ConditionFilter = ({ selectedConditions, onChange }: ConditionFilterProps) => {
  const handleConditionChange = (condition: string, isChecked: boolean) => {
    if (isChecked) {
      onChange([...selectedConditions, condition]);
    } else {
      onChange(selectedConditions.filter(c => c !== condition));
    }
  };

  return (
    <div className="space-y-2">
      <Label>Condition</Label>
      <div className="space-y-2">
        {conditions.map(condition => (
          <div key={condition} className="flex items-center space-x-2">
            <Checkbox 
              id={`condition-${condition}`} 
              checked={selectedConditions.includes(condition)}
              onCheckedChange={(checked) => handleConditionChange(condition, checked === true)}
            />
            <Label htmlFor={`condition-${condition}`} className="cursor-pointer text-sm">
              {condition}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConditionFilter;
