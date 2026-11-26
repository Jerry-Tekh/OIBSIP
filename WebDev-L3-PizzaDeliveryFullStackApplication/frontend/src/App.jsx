import { Navigate, Route, Routes, useParams } from "react-router-dom";
import HomePage from "./features/home/HomePage.jsx";
import LoginPage from "./features/auth/LoginPage.jsx";
import SignupPage from "./features/auth/SignupPage.jsx";
import VerifyEmailPage from "./features/auth/VerifyEmailPage.jsx";
import ProtectedRoute from "./features/auth/components/ProtectedRoute.jsx";
import DashboardBuilder from "./features/dashboard/shared/DashboardBuilder.jsx";

import CustomerOverviewPage from "./features/dashboard/customer/pages/CustomerOverviewPage.jsx";
import CustomerOrdersPage from "./features/dashboard/customer/pages/CustomerOrdersPage.jsx";
import CustomerAddressesPage from "./features/dashboard/customer/pages/CustomerAddressesPage.jsx";
import CustomerProfilePage from "./features/dashboard/customer/pages/CustomerProfilePage.jsx";
import CatalogPage from "./features/ordering/pages/CatalogPage.jsx";
import PizzaBuilderPage from "./features/ordering/pages/PizzaBuilderPage.jsx";
import PreviewPage from "./features/ordering/pages/PreviewPage.jsx";
import CheckoutPage from "./features/ordering/pages/CheckoutPage.jsx";
import PaymentPage from "./features/ordering/pages/PaymentPage.jsx";

import AdminOverviewPage from "./features/dashboard/admin/pages/AdminOverviewPage.jsx";
import AdminOrdersPage from "./features/dashboard/admin/pages/AdminOrdersPage.jsx";
import AdminInventoryPage from "./features/dashboard/admin/pages/AdminInventoryPage.jsx";
import AdminRecipesPage from "./features/dashboard/admin/pages/AdminRecipesPage.jsx";
import AdminProductsPage from "./features/dashboard/admin/pages/AdminProductsPage.jsx";
import AdminStockMovementsPage from "./features/dashboard/admin/pages/AdminStockMovementsPage.jsx";
import AdminLowStockPage from "./features/dashboard/admin/pages/AdminLowStockPage.jsx";

const customerNavigation = [
  { label: "Overview", path: "/dashboard", title: "Your dashboard", subtitle: "A little look at what's cooking." },
  { label: "Browse menu", path: "/dashboard/menu", title: "Browse the menu", subtitle: "Choose a pizza and make it your own." },
  { label: "My orders", path: "/dashboard/orders", title: "My orders", subtitle: "Your orders, all in one place." },
  { label: "Saved addresses", path: "/dashboard/addresses", title: "Saved addresses", subtitle: "Manage your delivery destinations." },
  { label: "Profile", path: "/dashboard/profile", title: "Your profile", subtitle: "Manage your personal details." }
];
const adminNavigation = [
  { label: "Overview", path: "/admin", title: "Operations overview", subtitle: "A clear view of what's happening across your kitchen." },
  { label: "Orders", path: "/admin/orders", title: "Orders", subtitle: "Review and manage customer orders." },
  { label: "Products", path: "/admin/products", title: "Pizza products", subtitle: "Manage the sellable menu and storefront publishing." },
  { label: "Inventory", path: "/admin/inventory", title: "Inventory", subtitle: "Track ingredients, reservations and available stock." },
  { label: "Recipes", path: "/admin/recipes", title: "Recipes", subtitle: "Define the ingredient consumption for each product." },
  { label: "Stock movements", path: "/admin/stock-movements", title: "Stock movements", subtitle: "Review inventory movement history." },
  { label: "Low-stock alerts", path: "/admin/low-stock", title: "Low-stock alerts", subtitle: "Ingredients that need replenishment." }
];

function LegacyOrderRedirect() {
  const { slug } = useParams();
  return <Navigate to={`/dashboard/order/${slug}`} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/signin" element={<LoginPage />} />
      <Route path="/login" element={<Navigate to="/signin" replace />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/register" element={<Navigate to="/signup" replace />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />

      <Route element={<ProtectedRoute allowedRoles={["customer"]}><DashboardBuilder role="customer" navigation={customerNavigation} /></ProtectedRoute>}>
        <Route path="/dashboard" element={<CustomerOverviewPage />} />
        <Route path="/dashboard/menu" element={<CatalogPage />} />
        <Route path="/dashboard/order/:slug" element={<PizzaBuilderPage />} />
        <Route path="/dashboard/order/preview" element={<PreviewPage />} />
        <Route path="/dashboard/checkout" element={<CheckoutPage />} />
        <Route path="/dashboard/payment" element={<PaymentPage />} />
        <Route path="/dashboard/orders" element={<CustomerOrdersPage />} />
        <Route path="/dashboard/addresses" element={<CustomerAddressesPage />} />
        <Route path="/dashboard/profile" element={<CustomerProfilePage />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["admin"]}><DashboardBuilder role="admin" navigation={adminNavigation} /></ProtectedRoute>}>
        <Route path="/admin" element={<AdminOverviewPage />} />
        <Route path="/admin/orders" element={<AdminOrdersPage />} />
        <Route path="/admin/products" element={<AdminProductsPage />} />
        <Route path="/admin/inventory" element={<AdminInventoryPage />} />
        <Route path="/admin/recipes" element={<AdminRecipesPage />} />
        <Route path="/admin/stock-movements" element={<AdminStockMovementsPage />} />
        <Route path="/admin/low-stock" element={<AdminLowStockPage />} />
      </Route>

      <Route path="/menu" element={<Navigate to="/dashboard/menu" replace />} />
      <Route path="/order/preview" element={<Navigate to="/dashboard/order/preview" replace />} />
      <Route path="/order/:slug" element={<LegacyOrderRedirect />} />
      <Route path="/checkout" element={<Navigate to="/dashboard/checkout" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
