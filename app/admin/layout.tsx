import { AdminLayoutWrapper } from "@/components/admin/admin-layout-wrapper";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminLayoutWrapper>
        {children}
      </AdminLayoutWrapper>
    </ProtectedRoute>
  );
}