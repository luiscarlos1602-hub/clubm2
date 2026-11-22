import { SHELL_COPY } from "./shell-copy";

export function SkipLink() {
  return (
    <a
      href="#contenido"
      className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-2 focus-visible:left-2 focus-visible:z-[60] focus-visible:rounded-md focus-visible:bg-primary focus-visible:px-4 focus-visible:py-2 focus-visible:text-sm focus-visible:text-primary-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      {SHELL_COPY.skipToContent}
    </a>
  );
}
