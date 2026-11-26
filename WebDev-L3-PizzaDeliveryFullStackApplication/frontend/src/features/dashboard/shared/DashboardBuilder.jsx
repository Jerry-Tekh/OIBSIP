import { Outlet, useLocation } from "react-router-dom";
import DashboardShell from "./DashboardShell.jsx";

export default function DashboardBuilder({ role, navigation }) {
  const location = useLocation();
  const activeItem = navigation.find((item) => location.pathname === item.path || (item.path !== (role === "admin" ? "/admin" : "/dashboard") && location.pathname.startsWith(item.path + "/"))) || navigation[0];
  return (
    <DashboardShell role={role} active={activeItem?.label || "Overview"} navigation={navigation} title={activeItem?.title || activeItem?.label || "Dashboard"} subtitle={activeItem?.subtitle || ""}>
      <Outlet />
    </DashboardShell>
  );
}
