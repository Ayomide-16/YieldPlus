import { Cloud, Calendar, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

interface ClimateRecommendation {
  recommendation: string;
  source?: string;
  confidence?: string;
  date?: string;
  action?: string;
}

interface ClimateRecommendationsProps {
  recommendations: ClimateRecommendation[] | string[];
  title?: string;
}

const ClimateRecommendations = ({ recommendations, title }: ClimateRecommendationsProps) => {
  const { t } = useTranslation();

  if (!recommendations || recommendations.length === 0) return null;

  return (
    <Card className="shadow-[var(--shadow-card)] border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="h-5 w-5 text-primary" />
          {title || t('common.climateRecommendations')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.map((rec, idx) => {
          const isString = typeof rec === 'string';
          const recommendation = isString ? rec : rec.recommendation || rec.action;
          const source = !isString && rec.source ? rec.source : null;
          const confidence = !isString && rec.confidence ? rec.confidence : null;
          const date = !isString && rec.date ? rec.date : null;

          return (
            <div key={idx} className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/10">
              <AlertCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1 space-y-1">
                <p className="text-sm text-foreground leading-relaxed">{recommendation}</p>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {date}
                    </span>
                  )}
                  {source && (
                    <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-medium">
                      {source}
                    </span>
                  )}
                  {confidence && (
                    <span className="text-muted-foreground">
                      Confidence: {confidence}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default ClimateRecommendations;
