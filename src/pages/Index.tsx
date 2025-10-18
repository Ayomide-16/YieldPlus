import { Link } from "react-router-dom";
import { Sprout, Droplet, TrendingUp, TestTube } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import heroImage from "@/assets/hero-farmland.jpg";

const Index = () => {
  const { t } = useTranslation();
  
  const tools = [
    {
      title: t("tools.cropPlanner.title"),
      description: t("tools.cropPlanner.description"),
      icon: Sprout,
      path: "/crop-planner",
      gradient: "from-green-500/20 to-emerald-500/20",
      iconColor: "text-green-600"
    },
    {
      title: t("tools.soilAdvisor.title"),
      description: t("tools.soilAdvisor.description"),
      icon: TestTube,
      path: "/soil-advisor",
      gradient: "from-amber-500/20 to-orange-500/20",
      iconColor: "text-amber-600"
    },
    {
      title: t("tools.waterOptimizer.title"),
      description: t("tools.waterOptimizer.description"),
      icon: Droplet,
      path: "/water-optimizer",
      gradient: "from-blue-500/20 to-cyan-500/20",
      iconColor: "text-blue-600"
    },
    {
      title: t("tools.marketEstimator.title"),
      description: t("tools.marketEstimator.description"),
      icon: TrendingUp,
      path: "/market-estimator",
      gradient: "from-purple-500/20 to-pink-500/20",
      iconColor: "text-purple-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        />
        <div className="relative container mx-auto px-4 py-20 sm:py-28">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block mb-4">
              <Sprout className="h-16 w-16 text-primary animate-fade-in" />
            </div>
            <h1 className="text-5xl font-bold tracking-tight sm:text-7xl mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent animate-fade-in">
              {t("home.title")}
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in">
              {t("home.subtitle")}
            </p>
            <Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-shadow animate-fade-in">
              <Link to="/crop-planner">{t("home.getStarted")}</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">{t("home.features")}</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Comprehensive tools designed for modern African farming
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
          {tools.map((tool, index) => (
            <Card 
              key={tool.path} 
              className={`group border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl bg-gradient-to-br ${tool.gradient} backdrop-blur-sm animate-fade-in`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="space-y-4">
                <div className={`h-16 w-16 rounded-2xl bg-background/80 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <tool.icon className={`h-8 w-8 ${tool.iconColor}`} />
                </div>
                <CardTitle className="text-2xl">{tool.title}</CardTitle>
                <CardDescription className="text-base leading-relaxed">{tool.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="default" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Link to={tool.path}>Launch Tool</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
