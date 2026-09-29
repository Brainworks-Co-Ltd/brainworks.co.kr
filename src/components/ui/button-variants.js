import { cva } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex min-h-10 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[var(--bw-radius-control)] px-4 py-2 font-medium transition-colors duration-200 outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--bw-color-ink)] text-white hover:bg-[var(--bw-color-black)]",
        outline:
          "border border-[var(--bw-color-ink)] bg-transparent text-[var(--bw-color-ink)] hover:bg-[var(--bw-color-surface-muted)]",
        ghost:
          "bg-transparent text-[var(--bw-color-ink)] hover:bg-[var(--bw-color-surface-muted)]",
        link: "text-[var(--bw-color-ink)] underline-offset-4 hover:underline",
      },
      size: {
        default: "px-4 py-2",
        sm: "min-h-8 px-3 py-1.5 text-sm",
        lg: "min-h-12 px-6 py-3 text-lg",
        icon: "h-10 w-10 p-0",
        "icon-sm": "h-8 w-8 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export { buttonVariants };
