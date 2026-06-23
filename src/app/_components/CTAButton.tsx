"use client";

import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

interface CTAButtonProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function CTAButton({ children, className, style }: CTAButtonProps) {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const handleClick = () => {
    router.push(session ? "/dashboard" : "/signin");
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={className}
      style={style}
    >
      {children}
    </button>
  );
}
