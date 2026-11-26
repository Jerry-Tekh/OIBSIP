
import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./features/home/HomePage.jsx";
import LoginPage from "./features/auth/LoginPage.jsx";
import SignupPage from "./features/auth/SignupPage.jsx";
import VerifyEmailPage from "./features/auth/VerifyEmailPage.jsx";
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
      <Route path="/menu" element={<Navigate to="/dashboard/menu" replace />} />
      <Route path="/order/preview" element={<Navigate to="/dashboard/order/preview" replace />} />
      <Route path="/order/:slug" element={<Navigate to="/dashboard/order/:slug" replace />} />
      <Route path="/checkout" element={<Navigate to="/dashboard/checkout" replace />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/*" element={<AdminDashboard />} />
      <Route path="/dashboard" element={<CustomerDashboard />} />
      <Route path="/dashboard/*" element={<CustomerDashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
