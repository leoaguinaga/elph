import { PortalHeader } from "./_components/PortalHeader";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full min-h-screen bg-bg overflow-x-hidden">
      <PortalHeader />
      {children}
    </div>
  );
}
