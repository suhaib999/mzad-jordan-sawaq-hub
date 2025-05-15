
import { Toaster as SonnerToaster } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";

export function Toaster() {
  // Add safe fallback if ThemeProvider is not available
  let theme: "light" | "dark" | "system" = "light";
  
  try {
    // Get theme from context
    const themeContext = useTheme();
    theme = themeContext.theme as "light" | "dark" | "system";
  } catch (error) {
    // Fallback to system theme if context is not available
    console.warn("ThemeContext not available - falling back to system theme");
    theme = "system";
  }

  return (
    <SonnerToaster
      theme={theme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
    />
  );
}
