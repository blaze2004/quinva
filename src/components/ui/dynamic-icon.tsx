import { type LucideProps, Wallet, icons } from "lucide-react";
import { memo } from "react";

interface DynamicIconProps extends LucideProps {
  name: keyof typeof icons;
}

const DynamicIcon = memo(({ name, ...props }: DynamicIconProps) => {
  const LucideIcon = icons[name];

  if (!LucideIcon) {
    return <Wallet {...props} />; // Fallback icon
  }

  return <LucideIcon {...props} />;
});

export { DynamicIcon };
