import { ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

interface DataSource {
  name: string;
  url: string;
}

interface DataSourcesProps {
  sources: DataSource[];
}

const DataSources = ({ sources }: DataSourcesProps) => {
  const { t } = useTranslation();

  if (!sources || sources.length === 0) return null;

  return (
    <Card className="shadow-[var(--shadow-card)]">
      <CardHeader>
        <CardTitle className="text-lg">{t('dataSources')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {sources.map((source, idx) => (
            <a
              key={idx}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
            >
              <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-sm font-medium group-hover:text-primary transition-colors">
                {source.name}
              </span>
              <span className="text-xs text-muted-foreground ml-auto truncate max-w-[200px]">
                {source.url}
              </span>
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DataSources;
