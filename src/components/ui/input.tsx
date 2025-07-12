import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          // CAMBIA ESTOS ESTILOS PARA FONDO CLARO
          "flex h-12 w-full rounded-lg border border-[#CBB593] bg-[#F7F0E7] px-4 py-2 text-[#45382C] placeholder:text-[#AD8651] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#CBB593] focus:border-[#AD8651] transition",
          className
        )}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
