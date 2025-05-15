
import { Toaster as SonnerToaster } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";

export function Toaster() {
  // Add safe fallback if ThemeProvider is not available
  let theme: string;
  
  try {
    // Get theme from context
    const themeContext = useTheme();
    theme = themeContext.theme;
  } catch (error) {
    // Fallback to light theme if context is not available
    console.error("ThemeContext not available:", error);
    theme = "light";
  }

  return (
    <SonnerToaster
      theme={theme as "light" | "dark" | "system"}
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
