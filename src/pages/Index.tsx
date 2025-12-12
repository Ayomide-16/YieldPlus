import { Link, useNavigate } from "react-router-dom";
import {
  Sprout, Droplet, TrendingUp, TestTube, Tractor, Bug,
  ArrowRight, Leaf, Zap, Shield, Check, Star, ChevronRight,
  Play, Sparkles, Target, LineChart, CloudRain
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: "AI-Powered Insights",
      description: "Get personalized recommendations based on your farm's unique conditions, local weather patterns, and market dynamics.",
      color: "from-yellow-500 to-orange-500",
      bg: "bg-yellow-500/10",
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Precision Planning",
      description: "Optimize every aspect of your farm with data-driven planting schedules, irrigation timing, and harvest windows.",
      color: "from-blue-500 to-cyan-500",
      bg: "bg-blue-500/10",
    },
    {
      icon: <LineChart className="h-6 w-6" />,
      title: "Market Intelligence",
      description: "Stay ahead with real-time price tracking and predictive analytics to maximize your profit margins.",
      color: "from-green-500 to-emerald-500",
      bg: "bg-green-500/10",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Risk Protection",
      description: "Identify potential threats before they impact your crops with early warning systems and preventive measures.",
      color: "from-purple-500 to-pink-500",
      bg: "bg-purple-500/10",
    },
  ];

  const tools = [
    { icon: <Tractor className="h-5 w-5" />, name: "Farm Planner", path: "/comprehensive-plan" },
    { icon: <Sprout className="h-5 w-5" />, name: "Crop Advisor", path: "/crop-planner" },
    { icon: <TestTube className="h-5 w-5" />, name: "Soil Analysis", path: "/soil-advisor" },
    { icon: <Droplet className="h-5 w-5" />, name: "Water Management", path: "/water-optimizer" },
    { icon: <TrendingUp className="h-5 w-5" />, name: "Market Prices", path: "/market-estimator" },
    { icon: <Bug className="h-5 w-5" />, name: "Pest Detection", path: "/pest-identifier" },
  ];

  const stats = [
    { value: "10K+", label: "Active Farmers" },
    { value: "50K+", label: "Hectares Managed" },
    { value: "35%", label: "Avg. Yield Increase" },
    { value: "15+", label: "Countries" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleGetStarted = () => {
    navigate(user ? "/comprehensive-plan" : "/auth");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ========== HERO ========== */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-emerald-500/5" />

        {/* Animated grid pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />

        {/* Floating orbs */}
        <motion.div
          className="absolute top-20 right-[20%] w-72 h-72 rounded-full bg-gradient-to-br from-primary/20 to-emerald-500/20 blur-3xl"
          animate={{ y: [0, -30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 left-[10%] w-96 h-96 rounded-full bg-gradient-to-br from-emerald-500/15 to-primary/15 blur-3xl"
          animate={{ y: [0, 30, 0], scale: [1, 0.9, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered Smart Farming</span>
            </motion.div>

            {/* Main heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]"
            >
              Farm Smarter,{" "}
              <span className="bg-gradient-to-r from-primary via-emerald-500 to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-shift">
                Not Harder
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Transform your agricultural operations with AI-driven insights.
              Get personalized recommendations for crops, soil, water, and market timing.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            >
              <Button
                size="lg"
                className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-emerald-600 hover:opacity-90 shadow-lg shadow-primary/25"
                onClick={handleGetStarted}
              >
                {user ? "Go to Dashboard" : "Start Free"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Play className="mr-2 h-5 w-5" />
                See How It Works
              </Button>
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap justify-center gap-8 md:gap-12"
            >
              {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl md:text-4xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========== FEATURES ========== */}
      <section id="features" className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            {/* Left - Feature list */}
            <div>
              <motion.span
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-primary font-medium mb-4 block"
              >
                WHY YIELDPLUS
              </motion.span>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl md:text-5xl font-bold mb-12"
              >
                Everything you need to{" "}
                <span className="text-primary">grow better</span>
              </motion.h2>

              <div className="space-y-4">
                {features.map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className={`p-5 rounded-2xl cursor-pointer transition-all duration-300 ${activeFeature === i
                      ? 'bg-card border border-border shadow-lg'
                      : 'hover:bg-muted/50'
                      }`}
                    onClick={() => setActiveFeature(i)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${feature.bg}`}>
                        <div className={`bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`}>
                          {feature.icon}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                        <AnimatePresence mode="wait">
                          {activeFeature === i && (
                            <motion.p
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="text-muted-foreground text-sm leading-relaxed"
                            >
                              {feature.description}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                      <ChevronRight className={`h-5 w-5 transition-transform ${activeFeature === i ? 'rotate-90 text-primary' : 'text-muted-foreground'}`} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right - Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/10 via-card to-emerald-500/10 border border-border/50 p-8 relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-primary/20 blur-xl" />
                  <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-emerald-500/20 blur-xl" />
                </div>

                {/* Content */}
                <div className="relative h-full flex flex-col justify-center items-center text-center">
                  <motion.div
                    key={activeFeature}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    <div className={`w-24 h-24 rounded-3xl ${features[activeFeature].bg} flex items-center justify-center mx-auto`}>
                      <div className={`bg-gradient-to-r ${features[activeFeature].color} bg-clip-text text-transparent scale-150`}>
                        {features[activeFeature].icon}
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold">{features[activeFeature].title}</h3>
                    <p className="text-muted-foreground max-w-xs">{features[activeFeature].description}</p>
                  </motion.div>
                </div>

                {/* Progress indicators */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                  {features.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveFeature(i)}
                      className={`h-1.5 rounded-full transition-all ${activeFeature === i ? 'w-8 bg-primary' : 'w-1.5 bg-muted-foreground/30'
                        }`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========== TOOLS ========== */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-primary font-medium mb-4 block"
            >
              POWERFUL TOOLS
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold mb-4"
            >
              Your complete farming suite
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-muted-foreground text-lg max-w-xl mx-auto"
            >
              Six powerful AI tools designed specifically for African agriculture
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {tools.map((tool, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4 }}
                onClick={() => navigate(user ? tool.path : "/auth")}
                className="group p-5 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-lg cursor-pointer transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {tool.icon}
                  </div>
                  <span className="font-medium group-hover:text-primary transition-colors">{tool.name}</span>
                  <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CTA ========== */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
              <Leaf className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Join 10,000+ farmers</span>
            </div>

            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Ready to transform{" "}
              <span className="text-primary">your farm?</span>
            </h2>

            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Start using AI-powered tools today. No credit card required.
            </p>

            <Button
              size="lg"
              className="text-xl px-12 py-8 bg-gradient-to-r from-primary to-emerald-600 hover:opacity-90 shadow-lg shadow-primary/25"
              onClick={handleGetStarted}
            >
              {user ? "Go to Dashboard" : "Get Started — It's Free"}
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button>

            <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>Free forever plan</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>No credit card</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Sprout className="h-6 w-6 text-primary" />
              </div>
              <span className="font-bold text-xl">YieldPlus.ai</span>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">Features</a>
              <a href="#" className="hover:text-primary transition-colors">Pricing</a>
              <a href="#" className="hover:text-primary transition-colors">Resources</a>
              <a href="#" className="hover:text-primary transition-colors">Support</a>
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            </div>

            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} YieldPlus.ai
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
