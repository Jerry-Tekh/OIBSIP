import { Outlet, useLocation } from "react-router-dom";
import DashboardShell from "./DashboardShell.jsx";

export default function DashboardBuilder({ role, navigation }) {
  const location = useLocation();
  const pathname = location.pathname;
  const orderingRoute = role === "customer" && (
    pathname === "/dashboard/menu" ||
    pathname.startsWith("/dashboard/order/") ||
    pathname === "/dashboard/checkout" ||
    pathname === "/dashboard/payment"
  );
  const activeItem = orderingRoute
    ? navigation.find((item) => item.label === "Browse menu")
    : navigation.find((item) => pathname === item.path);
  const title = pathname.includes("/order/preview") ? "Review your pizza"
    : pathname.startsWith("/dashboard/order/") ? "Customize your pizza"
    : pathname === "/dashboard/checkout" ? "Delivery details"
    : pathname === "/dashboard/payment" ? "Complete payment"
    : activeItem?.title || activeItem?.label || "Dashboard";
  const subtitle = pathname.includes("/order/preview") ? "Check availability and the calculated price before checkout."
    : pathname.startsWith("/dashboard/order/") ? "Choose the ingredients and quantity for your pizza."
    : pathname === "/dashboard/checkout" ? "Confirm your delivery address and create your order."
    : pathname === "/dashboard/payment" ? "Your order is ready for payment."
    : activeItem?.subtitle || "";
  return (
    <DashboardShell role={role} active={activeItem?.label || "Overview"} navigation={navigation} title={title} subtitle={subtitle}>
      <Outlet />
    </DashboardShell>
  );
}
