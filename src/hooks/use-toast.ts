
import * as React from "react";
import { toast as sonnerToast, type Toast as SonnerToast } from "sonner";
import type { ToastProps } from "@/components/ui/toast";

// Custom toast types that match shadcn's toast system
export type ToastActionElement = React.ReactElement;

export type Toast = ToastProps & {
  id?: string;
  title?: string;
  description?: string;
  action?: ToastActionElement;
  variant?: "default" | "destructive" | "success" | "warning" | "info";
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

// Helper function to process toast options
function processToastOptions(options: string | ToastOptions) {
  const opts = typeof options === "string" ? { description: options } : options;
  return opts;
}

// Create toast function that uses sonner under the hood
export const toast = {
  // Default toast
  default: (options: string | ToastOptions) => {
    const opts = processToastOptions(options);
    return sonnerToast(opts.title || "", {
      description: opts.description,
      action: opts.action,
      ...opts,
    });
  },
  // Destructive toast (error)
  destructive: (options: string | ToastOptions) => {
    const opts = processToastOptions(options);
    return sonnerToast.error(opts.title || "", {
      description: opts.description,
      action: opts.action,
      ...opts,
    });
  },
  // Success toast
  success: (options: string | ToastOptions) => {
    const opts = processToastOptions(options);
    return sonnerToast.success(opts.title || "", {
      description: opts.description,
      action: opts.action,
      ...opts,
    });
  },
  // Warning toast
  warning: (options: string | ToastOptions) => {
    const opts = processToastOptions(options);
    return sonnerToast.warning(opts.title || "", {
      description: opts.description,
      action: opts.action,
      ...opts,
    });
  },
  // Info toast
  info: (options: string | ToastOptions) => {
    const opts = processToastOptions(options);
    return sonnerToast.info(opts.title || "", {
      description: opts.description,
      action: opts.action,
      ...opts,
    });
  },
  // Original toast function for compatibility
  show: (options: string | ToastOptions) => {
    const opts = processToastOptions(options);
    const variant = opts.variant || "default";
    const type = variantToType[variant];
    
    if (type) {
      return sonnerToast[type](opts.title || "", {
        description: opts.description,
        action: opts.action,
        ...opts,
      });
    } else {
      return sonnerToast(opts.title || "", {
        description: opts.description,
        action: opts.action,
        ...opts,
      });
    }
  },
};
