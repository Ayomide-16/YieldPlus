import { Link } from "react-router-dom";
import { Sprout, LogOut, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navigation = () => {
  const { user, signOut } = useAuth();
  const { t } = useTranslation();

  return (
    <header className="border-b border-border bg-card sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <nav className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <Link to="/" className="flex items-center gap-2">
              <Sprout className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-foreground">Ceres.ai</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card z-50">
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    {t("auth.signOut")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="default" size="sm">{t("auth.signIn")}</Button>
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navigation;
