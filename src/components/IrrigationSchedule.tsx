import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Droplets, Sun, Cloud, Clock } from "lucide-react";

interface IrrigationScheduleProps {
  schedule: any[];
  title?: string;
}

export const IrrigationSchedule = ({ schedule, title = "Irrigation Schedule" }: IrrigationScheduleProps) => {
  if (!schedule || schedule.length === 0) {
    return null;
  }

  const getTimeIcon = (time: string) => {
    const hour = parseInt(time.split(':')[0]);
    if (hour >= 5 && hour < 12) return <Sun className="h-4 w-4 text-yellow-500" />;
    if (hour >= 12 && hour < 18) return <Sun className="h-4 w-4 text-orange-500" />;
    return <Cloud className="h-4 w-4 text-blue-500" />;
  };

  const getAmountColor = (amount: string) => {
    const num = parseFloat(amount);
    if (num < 10) return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
    if (num < 20) return "bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300";
    return "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300";
  };

  return (
    <Card className="shadow-[var(--shadow-card)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Droplets className="h-5 w-5 text-blue-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {schedule.map((item: any, idx: number) => (
            <div key={idx} className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-blue-50/50 to-cyan-50/50 dark:from-blue-950/20 dark:to-cyan-950/20 border border-blue-200/30 dark:border-blue-800/30">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="bg-background">
                    {item.day || item.period || item.week || `Day ${idx + 1}`}
                  </Badge>
                  {item.time && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      {getTimeIcon(item.time)}
                      <span>{item.time}</span>
                    </div>
                  )}
                </div>
                {item.notes && (
                  <p className="text-sm text-muted-foreground">{item.notes}</p>
                )}
                {item.description && (
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-2">
                {item.amount && (
                  <div className={`px-3 py-1.5 rounded-full font-semibold text-sm ${getAmountColor(item.amount)}`}>
                    <Droplets className="inline h-3 w-3 mr-1" />
                    {item.amount}
                  </div>
                )}
                {item.duration && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {item.duration}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Weekly Summary if available */}
        {schedule.length > 0 && (
          <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total Applications</p>
                <p className="text-2xl font-bold text-primary">{schedule.length}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Avg. per Application</p>
                <p className="text-2xl font-bold text-primary">
                  {(schedule.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0) / schedule.length).toFixed(1)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Weekly Total</p>
                <p className="text-2xl font-bold text-primary">
                  {schedule.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0).toFixed(1)}mm
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Frequency</p>
                <p className="text-2xl font-bold text-primary">
                  {schedule.length > 1 ? `${Math.floor(7 / schedule.length)}x/week` : 'Weekly'}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};