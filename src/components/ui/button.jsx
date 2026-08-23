import React from "react";

export function Button({
  children,
  className = "",
  variant = "default",
  size = "default",
  type = "button",
  ...props
}) {
  const baseStyles = {
    default: "bg-[var(--bw-color-ink)] text-white hover:bg-black",
    outline:
      "border border-[var(--bw-color-ink)] text-[var(--bw-color-ink)] hover:bg-[var(--bw-color-surface-muted)]",
    link: "text-[var(--bw-color-ink)] underline-offset-4 hover:underline",
  };

  const sizeStyles = {
    default: "",
    sm: "px-3 py-1.5 text-sm",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      type={type}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-[var(--bw-radius-control)] px-4 py-2 font-medium transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${baseStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
