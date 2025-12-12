import { Home, Sprout, Droplets, DollarSign, TestTube, Tractor, User, BookmarkIcon, LogOut, Bug, BookOpen, Leaf, ChevronRight } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const AppSidebar = () => {
  const { state } = useSidebar();
  const location = useLocation();
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const currentPath = location.pathname;

  const items = [
    { title: t("nav.home"), url: "/", icon: Home, color: "text-primary" },
    { title: t("nav.comprehensivePlan"), url: "/comprehensive-plan", icon: Tractor, color: "text-primary" },
    { title: t("nav.cropPlanner"), url: "/crop-planner", icon: Sprout, color: "text-green-500" },
    { title: t("nav.soilAdvisor"), url: "/soil-advisor", icon: TestTube, color: "text-amber-500" },
    { title: t("nav.waterOptimizer"), url: "/water-optimizer", icon: Droplets, color: "text-blue-500" },
    { title: t("nav.marketEstimator"), url: "/market-estimator", icon: DollarSign, color: "text-purple-500" },
    { title: t("nav.pestIdentifier"), url: "/pest-identifier", icon: Bug, color: "text-red-500" },
    { title: "Fertilizer Planner", url: "/fertilizer-planner", icon: Leaf, color: "text-emerald-500" },
    { title: t("nav.resources"), url: "/resources", icon: BookOpen, color: "text-indigo-500" },
  ];

  const isActive = (path: string) => currentPath === path;
  const isCollapsed = state === "collapsed";

  const NavItem = ({ item, index }: { item: typeof items[0]; index: number }) => {
    const active = isActive(item.url);

    const content = (
      <NavLink to={item.url} className="block">
        <motion.div
          className={`relative flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-3 px-3'} py-2.5 rounded-xl transition-all duration-200 group ${active
            ? "bg-primary/15 text-primary"
            : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"
            }`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.03 }}
          whileHover={isCollapsed ? { scale: 1.05 } : { x: 2 }}
        >

          {/* Icon */}
          <motion.div
            className={`flex-shrink-0 ${active ? "text-primary" : item.color} transition-colors`}
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.2 }}
          >
            <item.icon className="h-5 w-5" />
          </motion.div>

          {/* Label */}
          {!isCollapsed && (
            <span className={`text-sm font-medium ${active ? "text-primary" : ""}`}>
              {item.title}
            </span>
          )}

          {/* Hover arrow */}
          {!isCollapsed && (
            <ChevronRight className={`ml-auto h-4 w-4 opacity-0 group-hover:opacity-50 transition-opacity ${active ? "opacity-50" : ""}`} />
          )}
        </motion.div>
      </NavLink>
    );

    if (isCollapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" sideOffset={10}>
            {item.title}
          </TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  return (
    <Sidebar
      className={`${isCollapsed ? "w-16" : "w-64"} transition-all duration-300`}
      collapsible="icon"
    >
      <SidebarContent className="glass-strong border-r-0 bg-gradient-to-b from-card/95 via-card/90 to-muted/50">
        {/* Logo area */}
        {!isCollapsed && (
          <motion.div
            className="px-4 py-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3">
              <motion.div
                className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center shadow-glow"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Sprout className="h-6 w-6 text-primary" />
              </motion.div>
              <div>
                <h2 className="font-bold text-lg text-foreground">YieldPlus.ai</h2>
                <p className="text-xs text-muted-foreground">Smart Farming</p>
              </div>
            </div>
          </motion.div>
        )}

        {isCollapsed && (
          <motion.div
            className="flex justify-center py-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Sprout className="h-6 w-6 text-primary" />
            </div>
          </motion.div>
        )}

        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {t("home.features")}
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent className="px-2">
            <SidebarMenu className="space-y-1">
              {items.map((item, index) => (
                <SidebarMenuItem key={item.title}>
                  <NavItem item={item} index={index} />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {user && (
        <SidebarFooter className="glass-strong border-t border-border/50 p-3">
          {!isCollapsed ? (
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Separator className="opacity-50" />
              <div className="space-y-1">
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/my-plans"
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive("/my-plans")
                      ? "bg-primary/15 text-primary"
                      : "hover:bg-muted/60"
                      }`}
                  >
                    <BookmarkIcon className="h-4 w-4" />
                    <span className="text-sm">{t("nav.myPlans")}</span>
                  </NavLink>
                </SidebarMenuButton>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/my-farms"
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive("/my-farms")
                      ? "bg-primary/15 text-primary"
                      : "hover:bg-muted/60"
                      }`}
                  >
                    <Tractor className="h-4 w-4" />
                    <span className="text-sm">{t("nav.myFarms")}</span>
                  </NavLink>
                </SidebarMenuButton>
              </div>

              <Separator className="opacity-50" />

              {/* User profile card */}
              <motion.div
                className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center ring-2 ring-primary/30">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.email?.split('@')[0]}</p>
                  <p className="text-xs text-muted-foreground truncate">Pro Member</p>
                </div>
              </motion.div>

              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="mr-2 h-4 w-4" />
                {t("auth.signOut")}
              </Button>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => window.location.href = '/my-plans'}
                    className="hover:bg-primary/10"
                  >
                    <BookmarkIcon className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">{t("nav.myPlans")}</TooltipContent>
              </Tooltip>

              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={signOut}
                    className="hover:bg-destructive/10 hover:text-destructive"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">{t("auth.signOut")}</TooltipContent>
              </Tooltip>
            </div>
          )}
        </SidebarFooter>
      )}
    </Sidebar>
  );
};

export default AppSidebar;
