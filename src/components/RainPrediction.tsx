import { CloudRain, Droplet, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

interface RainPredictionProps {
  rainPredictions: {
    next24Hours?: {
      probability: string;
      expectedAmount: string;
      recommendation: string;
    };
    next7Days?: Array<{
      day: string;
      probability: string;
      amount: string;
      irrigationAdvice: string;
    }>;
    next30Days?: {
      totalExpected: string;
      averagePerWeek: string;
      irrigationAdjustment: string;
    };
  };
}

const RainPrediction = ({ rainPredictions }: RainPredictionProps) => {
  const { t } = useTranslation();

  if (!rainPredictions) return null;

  const getProbabilityColor = (prob: string) => {
    if (prob.toLowerCase().includes('high') || parseInt(prob) > 70) return 'text-primary';
    if (prob.toLowerCase().includes('medium') || parseInt(prob) > 40) return 'text-secondary';
    return 'text-muted-foreground';
  };

  return (
    <Card className="shadow-[var(--shadow-card)] border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CloudRain className="h-5 w-5 text-primary" />
          {t('common.rainPredictions')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {rainPredictions.next24Hours && (
          <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Next 24 Hours
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Probability</p>
                <p className={`text-lg font-bold ${getProbabilityColor(rainPredictions.next24Hours.probability)}`}>
                  {rainPredictions.next24Hours.probability}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Expected Amount</p>
                <p className="text-lg font-bold text-primary">{rainPredictions.next24Hours.expectedAmount}</p>
              </div>
            </div>
            <div className="mt-4 p-3 rounded bg-background/50 border border-primary/10">
              <p className="text-sm font-medium text-primary">
                💧 {rainPredictions.next24Hours.recommendation}
              </p>
            </div>
          </div>
        )}

        {rainPredictions.next7Days && rainPredictions.next7Days.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3">7-Day Forecast</h4>
            <div className="space-y-2">
              {rainPredictions.next7Days.map((day, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Droplet className="h-4 w-4 text-primary" />
                    <div>
                      <p className="font-medium text-sm">{day.day}</p>
                      <p className="text-xs text-muted-foreground">{day.irrigationAdvice}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${getProbabilityColor(day.probability)}`}>
                      {day.probability}
                    </p>
                    <p className="text-xs text-muted-foreground">{day.amount}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {rainPredictions.next30Days && (
          <div className="p-4 rounded-lg bg-accent/30">
            <h4 className="font-semibold mb-3">30-Day Overview</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Expected</span>
                <span className="font-bold text-primary">{rainPredictions.next30Days.totalExpected}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Average per Week</span>
                <span className="font-bold">{rainPredictions.next30Days.averagePerWeek}</span>
              </div>
              <div className="mt-3 p-2 rounded bg-primary/10 border border-primary/20">
                <p className="text-sm text-foreground">
                  <span className="font-semibold">Irrigation Adjustment:</span>{' '}
                  {rainPredictions.next30Days.irrigationAdjustment}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RainPrediction;
