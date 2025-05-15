
import { toast as sonnerToast, type ToasterToast } from "sonner"
import { useToast as useShadcnToast } from "@/components/ui/use-toast"

// Re-export the useToast hook for backward compatibility
export const useToast = useShadcnToast;

// Custom toast function that uses sonner for better toast experiences
export const toast = ({
  title,
  description,
  variant,
  action,
  ...props
}: {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success" | "warning" | "info";
  action?: React.ReactNode;
  [key: string]: any;
}) => {
  // Map variants to sonner's styles
  const variantToType: Record<string, "success" | "error" | "warning" | "info" | undefined> = {
    default: undefined,
    destructive: "error",
    success: "success",
    warning: "warning",
    info: "info"
  };

  // Use sonner toast
  return sonnerToast(title, {
    description,
    action,
    type: variantToType[variant || "default"],
    ...props,
  });
};
