import { Link } from "react-router-dom";
import { Sprout, Droplet, TrendingUp, TestTube, Tractor, Bug, BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import heroImage from "@/assets/hero-farmland.jpg";

const Index = () => {
  const { t } = useTranslation();
  
  const mainTool = {
    title: "Comprehensive Farm Planner",
    description: "All-in-one farm planning with real-time climate data, soil analysis, water management, market insights, and pest management",
    icon: Tractor,
    path: "/comprehensive-plan",
    gradient: "from-primary/20 to-primary/10"
  };

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
    },
    {
      title: t("tools.pestIdentifier.title"),
      description: t("tools.pestIdentifier.description"),
      icon: Bug,
      path: "/pest-identifier",
      gradient: "from-red-500/20 to-rose-500/20",
      iconColor: "text-red-600"
    },
    {
      title: "Resources & Expert Help",
      description: "Access study materials, agricultural news, and connect with farming experts",
      icon: BookOpen,
      path: "/resources",
      gradient: "from-indigo-500/20 to-violet-500/20",
      iconColor: "text-indigo-600"
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
              <Link to="/comprehensive-plan">{t("home.getStarted")}</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Tool Highlight */}
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-4xl mx-auto border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 shadow-2xl">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto mb-4 h-20 w-20 rounded-3xl bg-primary/20 flex items-center justify-center">
              <mainTool.icon className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-3xl mb-3">{mainTool.title}</CardTitle>
            <CardDescription className="text-lg max-w-2xl mx-auto">
              {mainTool.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-8">
            <Button asChild size="lg" className="shadow-lg">
              <Link to={mainTool.path}>
                <Tractor className="mr-2 h-5 w-5" />
                Create Your Farm Plan
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Tools Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Specialized Tools</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Individual tools for specific farming needs
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {tools.map((tool, index) => (
            <Card 
              key={tool.path} 
              className={`group border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl bg-gradient-to-br ${tool.gradient} backdrop-blur-sm animate-fade-in`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="space-y-3">
                <div className={`h-12 w-12 rounded-xl bg-background/80 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <tool.icon className={`h-6 w-6 ${tool.iconColor}`} />
                </div>
                <CardTitle className="text-xl">{tool.title}</CardTitle>
                <CardDescription className="text-sm leading-relaxed">{tool.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" size="sm" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
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
