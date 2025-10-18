import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const languages = [
    { code: "en", name: "English" },
    { code: "fr", name: "Français" },
    { code: "es", name: "Español" },
    { code: "pt", name: "Português" },
    { code: "ar", name: "العربية" },
    { code: "zh", name: "中文" },
    { code: "yo", name: "Yorùbá" },
    { code: "ha", name: "Hausa" },
    { code: "ig", name: "Igbo" },
    { code: "sw", name: "Kiswahili" },
  ];

  const handleLanguageChange = (value: string) => {
    i18n.changeLanguage(value);
  };

  return (
    <div className="flex items-center gap-2">
      <Languages className="h-4 w-4 text-primary" />
      <Select value={i18n.language} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-[140px] h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-card z-50">
          {languages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              {lang.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSwitcher;
