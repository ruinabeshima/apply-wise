import { Route, Routes } from "react-router-dom";
import Dashboard from "./components/dashboard";
import Home from "./components/home";
import { SignIn, SignUp } from "@clerk/clerk-react";
import ProtectedRoute from "./protected_routes";

const routes = (
  <Routes>
    <Route path="/" element={<Home />}></Route>
    <Route
      path="/register"
      element={<SignUp signInUrl="/login" forceRedirectUrl="/dashboard" />}
    ></Route>
    <Route
      path="/login"
      element={<SignIn signUpUrl="/register" forceRedirectUrl="/dashboard" />}
    ></Route>
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      }
    ></Route>
  </Routes>
);

export default routes;
