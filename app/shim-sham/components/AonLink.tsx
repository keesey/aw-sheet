import type { ReactNode } from "react";
import { isAllowedAonUrl } from "@/lib/shim-sham/url";

export function AonLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  if (!isAllowedAonUrl(href)) {
    return <span className={className}>{children}</span>;
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  );
}
