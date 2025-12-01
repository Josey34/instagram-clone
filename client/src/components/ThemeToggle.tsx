import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

const ThemeToggle = () => {
    const [theme, setTheme] = useState<string>(
        localStorage.getItem("theme") || "light"
    );

    useEffect(() => {
        const root = document.documentElement;

        // Remove both classes first
        root.classList.remove("light", "dark");

        // Add the current theme class
        root.classList.add(theme);

        // Store in localStorage
        localStorage.setItem("theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(theme === "light" ? "dark" : "light");
    };

    return (
        <div className="fixed bottom-20 lg:bottom-6 right-6 z-50">
            <Button
                onClick={toggleTheme}
                size="icon"
                className="h-14 w-14 rounded-full shadow-lg"
                aria-label="Toggle theme"
            >
                {theme === "light" ? (
                    <Moon className="h-6 w-6" />
                ) : (
                    <Sun className="h-6 w-6" />
                )}
            </Button>
        </div>
    );
};

export default ThemeToggle;
