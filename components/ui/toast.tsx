"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CircleAlert, CircleCheck, X } from "lucide-react";
import { Toast as ToastPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error";

type ToastItem = {
  id: number;
  message: string;
  variant: ToastVariant;
  open: boolean;
};

type ToastApi = {
  success: (message: string) => void;
  error: (message: string) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

/**
 * Thông báo nổi dùng chung cho các trang trong app (Radix Toast — đã có sẵn
 * trong package `radix-ui`). Gọi qua `useToast()`.
 */
export function Toaster({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const push = useCallback((message: string, variant: ToastVariant) => {
    const id = ++nextId.current;
    setToasts((current) => [...current, { id, message, variant, open: true }]);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((current) =>
      current.map((item) => (item.id === id ? { ...item, open: false } : item)),
    );
    // Giữ node thêm một chút cho animation đóng chạy xong rồi mới bỏ khỏi state.
    setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 200);
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      success: (message) => push(message, "success"),
      error: (message) => push(message, "error"),
    }),
    [push],
  );

  return (
    <ToastPrimitive.Provider swipeDirection="right" duration={4000}>
      <ToastContext value={api}>{children}</ToastContext>

      {toasts.map((item) => {
        const Icon = item.variant === "success" ? CircleCheck : CircleAlert;
        return (
          <ToastPrimitive.Root
            key={item.id}
            open={item.open}
            onOpenChange={(open) => {
              if (!open) dismiss(item.id);
            }}
            type={item.variant === "error" ? "foreground" : "background"}
            className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 text-sm shadow-lg shadow-black/30 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom-2 data-[swipe=end]:translate-x-(--radix-toast-swipe-end-x) data-[swipe=move]:translate-x-(--radix-toast-swipe-move-x)"
          >
            <Icon
              className={cn(
                "mt-0.5 size-4 shrink-0",
                item.variant === "success" ? "text-success" : "text-destructive",
              )}
            />
            <ToastPrimitive.Description className="flex-1 font-medium">
              {item.message}
            </ToastPrimitive.Description>
            <ToastPrimitive.Close
              aria-label="Đóng"
              className="-m-1 rounded-full p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <X className="size-3.5" />
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        );
      })}

      <ToastPrimitive.Viewport className="fixed right-4 bottom-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2 outline-none" />
    </ToastPrimitive.Provider>
  );
}

export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) throw new Error("useToast() phải nằm trong <Toaster>.");
  return api;
}
