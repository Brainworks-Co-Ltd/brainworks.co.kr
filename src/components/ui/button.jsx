import { Button as ButtonPrimitive } from "@base-ui/react/button";

import { cn } from "@/lib/utils";
import { buttonVariants } from "./button-variants";

export function Button({
  className = "",
  variant = "default",
  size = "default",
  type = "button",
  ...props
}) {
  return (
    <ButtonPrimitive
      type={type}
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { buttonVariants };
