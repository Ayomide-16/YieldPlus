import { Home, Sprout, Droplets, DollarSign, TestTube, Tractor, User, BookmarkIcon, LogOut, Bug, BookOpen, Leaf } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
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

const AppSidebar = () => {
  const { state } = useSidebar();
  const location = useLocation();
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const currentPath = location.pathname;

  const items = [
    { title: t("nav.home"), url: "/", icon: Home },
    { title: t("nav.comprehensivePlan"), url: "/comprehensive-plan", icon: Tractor },
    { title: t("nav.cropPlanner"), url: "/crop-planner", icon: Sprout },
    { title: t("nav.soilAdvisor"), url: "/soil-advisor", icon: TestTube },
    { title: t("nav.waterOptimizer"), url: "/water-optimizer", icon: Droplets },
    { title: t("nav.marketEstimator"), url: "/market-estimator", icon: DollarSign },
    { title: t("nav.pestIdentifier"), url: "/pest-identifier", icon: Bug },
    { title: "Fertilizer Planner", url: "/fertilizer-planner", icon: Leaf },
    { title: t("nav.resources"), url: "/resources", icon: BookOpen },
  ];

  const isActive = (path: string) => currentPath === path;
  const getNavCls = (path: string) =>
    isActive(path)
      ? "bg-primary/10 text-primary font-medium"
      : "hover:bg-muted/50";

  const isCollapsed = state === "collapsed";

  return (
    <Sidebar
      className={isCollapsed ? "w-14" : "w-64"}
      collapsible="icon"
    >
      <SidebarContent className="bg-gradient-to-b from-card to-muted/30">
        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? "hidden" : "text-sm font-semibold text-muted-foreground"}>
            {t("home.features")}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls(item.url)}>
                      <item.icon className={isCollapsed ? "h-5 w-5" : "mr-3 h-4 w-4"} />
                      {!isCollapsed && <span className="text-sm">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {user && (
        <SidebarFooter className="border-t border-border bg-card/50 p-4">
          {!isCollapsed ? (
            <div className="space-y-3">
              <Separator />
              <div className="space-y-2">
                <SidebarMenuButton asChild>
                  <NavLink to="/my-plans" className={getNavCls("/my-plans")}>
                    <BookmarkIcon className="mr-3 h-4 w-4" />
                    <span className="text-sm">{t("nav.myPlans")}</span>
                  </NavLink>
                </SidebarMenuButton>
                <SidebarMenuButton asChild>
                  <NavLink to="/my-farms" className={getNavCls("/my-farms")}>
                    <Tractor className="mr-3 h-4 w-4" />
                    <span className="text-sm">{t("nav.myFarms")}</span>
                  </NavLink>
                </SidebarMenuButton>
              </div>
              <Separator />
              <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-muted/50">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.email}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="w-full justify-start"
              >
                <LogOut className="mr-2 h-4 w-4" />
                {t("auth.signOut")}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => window.location.href = '/my-plans'}
                title={t("nav.myPlans")}
              >
                <BookmarkIcon className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={signOut}
                title={t("auth.signOut")}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          )}
        </SidebarFooter>
      )}
    </Sidebar>
  );
};

export default AppSidebar;
