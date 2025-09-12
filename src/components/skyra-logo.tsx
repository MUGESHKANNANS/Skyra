import { cn } from "@/lib/utils";
import { Cloud } from "lucide-react";
import type { SVGProps } from "react";

export function SkyraLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <Cloud className={cn("text-primary", props.className)} {...props} />
  );
}
