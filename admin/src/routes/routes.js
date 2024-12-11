import { DefaultLayout } from "../layout/DefaultLayout";
import { AuthLayout } from "../layout";

// Pages
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Orders from "../pages/Orders";
import Products from "../pages/Products";
import Users from "../pages/Users";
import Seller from "../pages/Seller";
import Approve from "../pages/Approve";
// Public routes
const publicRoutes = [
  {
    path: "/register",
    component: Register,
    layout: AuthLayout,
    guestOnly: true,
  },
  {
    path: "/login",
    component: Login,
    layout: AuthLayout,
    guestOnly: true,
  },
  {
    path: "/",
    component: Home,
    requiredLogin: true,
  },
  {
    path: "/orders",
    component: Orders,
    requiredLogin: true,
  },
  {
    path: "/products",
    component: Products,
    requiredLogin: true,
  },
  {
    path: "/users",
    component: Users,
    requiredLogin: true,
  },
  {
    path: "/sellers",
    component: Seller,
    requiredLogin: true,
  },
  {
    path: "/approve",
    component: Approve,
    requiredLogin: true,
  },
];

const privateRoutes = [];
export { publicRoutes, privateRoutes };
