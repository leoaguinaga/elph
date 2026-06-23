import { PortalHeader } from "./_components/PortalHeader";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-w-[1280px] bg-bg">
      <PortalHeader />
      {children}
    </div>
  );
}
