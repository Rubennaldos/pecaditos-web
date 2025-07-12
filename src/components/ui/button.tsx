import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Cambia estos colores a tu paleta beige/marrón claro
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Color principal: beige/marrón claro, texto marrón oscuro
        default: "bg-[#DDC9AD] text-[#45382C] hover:bg-[#CBB593]",
        // Variante para acciones de borrar/eliminar
        destructive: "bg-red-500 text-white hover:bg-red-600",
        // Botón de borde y fondo claro
        outline: "border border-[#CBB593] bg-[#F7F0E7] text-[#45382C] hover:bg-[#EADBC8] hover:text-[#5A4331]",
        // Variante secundaria (puedes dejar igual o personalizar)
        secondary: "bg-[#EADBC8] text-[#45382C] hover:bg-[#D7C4AB]",
        // Fantasma (sin fondo, solo hover suave)
        ghost: "hover:bg-[#F7F0E7] hover:text-[#5A4331] text-[#45382C]",
        // Enlace (texto beige/marrón oscuro)
        link: "text-[#AD8651] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
