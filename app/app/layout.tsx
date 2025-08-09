import { ClientLayoutWrapper } from "@/components/client/client-layout-wrapper";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole="client">
      <ClientLayoutWrapper>
        {children}
      </ClientLayoutWrapper>
    </ProtectedRoute>
  );
}