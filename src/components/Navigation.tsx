import { Link } from "react-router-dom";
import { Sprout, LogOut, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
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
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled
          ? "glass-strong border-b border-border/50 shadow-sm"
          : "bg-card/80 backdrop-blur-sm border-b border-border"
        }`}
    >
      <div className="container mx-auto px-4">
        <nav className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="hover:scale-110 transition-transform duration-200" />
            <Link to="/" className="flex items-center gap-2 group">
              <Sprout className="h-6 w-6 text-primary group-hover:animate-bounce-subtle transition-transform" />
              <span className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-200">
                YieldPlus.ai
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-primary/10 hover:text-primary transition-all duration-200"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass-strong border-border/50 animate-scale-in">
                  <DropdownMenuItem onClick={signOut} className="cursor-pointer hover:bg-primary/10">
                    <LogOut className="mr-2 h-4 w-4" />
                    {t("auth.signOut")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="default" size="sm" className="shadow-glow">
                  {t("auth.signIn")}
                </Button>
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navigation;

