import HomePage from "./features/home/HomePage.jsx";
import LoginPage from "./features/auth/LoginPage.jsx";
import SignupPage from "./features/auth/SignupPage.jsx";

export default function App() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";

  if (path === "/signin" || path === "/login") return <LoginPage />;
  if (path === "/signup" || path === "/register") return <SignupPage />;
  return <HomePage />;
}
