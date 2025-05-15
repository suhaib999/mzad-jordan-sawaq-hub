
import { toast as sonnerToast } from "sonner";
import type { ToastProps } from "@/components/ui/toast";

// Custom toast types that match shadcn's toast system
export type ToastActionElement = React.ReactElement;

export type Toast = ToastProps & {
  id: string;
  title?: string;
  description?: string;
  action?: ToastActionElement;
};

type ToastOptions = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success" | "warning" | "info";
  action?: React.ReactNode;
  [key: string]: any;
};

// Custom toast store to manage toast state
const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 1000;

type ToasterToast = Toast & {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactElement;
};

let listeners: ((toasts: ToasterToast[]) => void)[] = [];

let toasts: ToasterToast[] = [];

function createToast(props: Toast) {
  const id = props.id || String(Date.now());
  
  const newToast = {
    ...props,
    id,
  };
  
  toasts = [newToast, ...toasts].slice(0, TOAST_LIMIT);
  
  listeners.forEach((listener) => {
    listener(toasts);
  });

  return newToast;
}

function dismissToast(toastId?: string) {
  toasts = toastId
    ? toasts.filter((t) => t.id !== toastId)
    : [];
  
  listeners.forEach((listener) => {
    listener(toasts);
  });
}

// Hook for consuming toast from components
export function useToast() {
  const [localToasts, setLocalToasts] = React.useState<ToasterToast[]>([]);
  
  React.useEffect(() => {
    listeners.push(setLocalToasts);
    return () => {
      listeners = listeners.filter(listener => listener !== setLocalToasts);
    };
  }, []);
  
  return {
    toasts: localToasts,
    toast: createToast,
    dismiss: dismissToast,
  };
}

// Map variants to sonner's styles
const variantToType: Record<string, "success" | "error" | "warning" | "info" | undefined> = {
  default: undefined,
  destructive: "error",
  success: "success",
  warning: "warning",
  info: "info"
};

// Simple toast function that uses sonner under the hood
export const toast = (options: ToastOptions) => {
  const {
    title,
    description,
    variant = "default",
    action,
    ...props
  } = options;

  // Use sonner toast
  return sonnerToast(title, {
    description,
    action,
    // Use proper type handling for sonner
    ...props,
    ...(variant && variantToType[variant] ? { type: variantToType[variant] } : {}),
  });
};
