import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Droplet, TrendingUp, TestTube2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ToolSuggestionsProps {
  currentTool: string;
  farmData?: any;
}

const ToolSuggestions = ({ currentTool, farmData }: ToolSuggestionsProps) => {
  const navigate = useNavigate();

  const suggestions = {
    crop: [
      { title: "Optimize Water Usage", description: "Based on your crop selection, optimize irrigation", icon: Droplet, path: "/water-optimizer" },
      { title: "Check Soil Health", description: "Ensure your soil supports these crops", icon: TestTube2, path: "/soil-advisor" },
      { title: "Estimate Market Price", description: "See potential profits for your crops", icon: TrendingUp, path: "/market-estimator" }
    ],
    soil: [
      { title: "Plan Your Crops", description: "Choose the best crops for your soil", icon: TestTube2, path: "/crop-planner" },
      { title: "Water Management", description: "Optimize irrigation for soil type", icon: Droplet, path: "/water-optimizer" }
    ],
    water: [
      { title: "Plan Your Crops", description: "Select water-efficient crops", icon: TestTube2, path: "/crop-planner" },
      { title: "Market Estimates", description: "Calculate returns on water investment", icon: TrendingUp, path: "/market-estimator" }
    ],
    market: [
      { title: "Plan Your Crops", description: "Maximize profits with crop planning", icon: TestTube2, path: "/crop-planner" },
      { title: "Water Efficiency", description: "Reduce costs with water optimization", icon: Droplet, path: "/water-optimizer" }
    ]
  };

  const currentSuggestions = suggestions[currentTool as keyof typeof suggestions] || [];

  if (currentSuggestions.length === 0) return null;

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-accent/10 border-primary/20 shadow-[var(--shadow-card)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Next Steps
        </CardTitle>
        <CardDescription>Continue optimizing your farm with these tools</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {currentSuggestions.map((suggestion, idx) => {
          const Icon = suggestion.icon;
          return (
            <Button
              key={idx}
              variant="outline"
              className="h-auto p-4 flex flex-col items-start gap-2 hover:bg-primary/10 hover:border-primary transition-all"
              onClick={() => navigate(suggestion.path)}
            >
              <Icon className="h-6 w-6 text-primary" />
              <div className="text-left">
                <p className="font-semibold text-sm">{suggestion.title}</p>
                <p className="text-xs text-muted-foreground">{suggestion.description}</p>
              </div>
              <ArrowRight className="h-4 w-4 ml-auto text-primary" />
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default ToolSuggestions;
