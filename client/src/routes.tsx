import { Route, Routes } from "react-router-dom";
import Dashboard from "./pages/dashboard";
import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/register";
import ProtectedRoute from "./protected_routes";
import AddApplication from "./pages/AddApplication";
import Onboarding from "./pages/onboarding";

const routes = (
  <Routes>
    <Route path="/" element={<Home />}></Route>
    <Route path="/register" element={<Register />}></Route>
    <Route path="/login" element={<Login />}></Route>
    <Route path="/onboarding" element={<Onboarding />}></Route>
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      }
    ></Route>
    <Route
      path="/applications/add"
      element={
        <ProtectedRoute>
          <AddApplication />
        </ProtectedRoute>
      }
    ></Route>
  </Routes>
);

export default routes;
