
import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./features/home/HomePage.jsx";
import LoginPage from "./features/auth/LoginPage.jsx";
import SignupPage from "./features/auth/SignupPage.jsx";
import VerifyEmailPage from "./features/auth/VerifyEmailPage.jsx";
import CatalogPage from "./features/ordering/pages/CatalogPage.jsx";
import PizzaBuilderPage from "./features/ordering/pages/PizzaBuilderPage.jsx";
import PreviewPage from "./features/ordering/pages/PreviewPage.jsx";
import CheckoutPage from "./features/ordering/pages/CheckoutPage.jsx";
import AdminDashboard from "./features/dashboard/admin/AdminDashboard.jsx";
import CustomerDashboard from "./features/dashboard/customer/CustomerDashboard.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/signin" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/register" element={<SignupPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/menu" element={<CatalogPage />} />
      <Route path="/order/:slug" element={<PizzaBuilderPage />} />
      <Route path="/order/preview" element={<PreviewPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/dashboard" element={<CustomerDashboard />} />
      <Route path="/dashboard/*" element={<CustomerDashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
