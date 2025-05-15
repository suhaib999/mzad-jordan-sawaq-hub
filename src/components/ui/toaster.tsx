
import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  // Use a simpler implementation without ThemeContext dependency
  // This avoids the "useTheme must be used within a ThemeProvider" error
  
  // Default to system theme
  let theme: "light" | "dark" | "system" = "system";
  
  // Try to get the user's preferred color scheme
  if (typeof window !== 'undefined') {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      theme = "dark";
    } else {
      theme = "light";
    }
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
