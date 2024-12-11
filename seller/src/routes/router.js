// Pages
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Profile from "../pages/Profile";
import Product from "../pages/Products";
import Order from "../pages/Orders";
import AllProducts from "../components/Product/AllProducts";
import PublishedProducts from "../components/Product/PublishedProducts";
import UnpublishedProducts from "../components/Product/UnpublishedProducts";
import HiddenProducts from "../components/Product/HiddenProducts";
import ViolationProducts from "../components/Product/ViolationProducts";
import COMPLETED from "../components/Order/COMPLETED";
import Shipping from "../components/Order/SHIPPING";
import Cancelled from "../components/Order/CANCELLED";
import All from "../components/Order/All";
// Public routes
const publicRoutes = [
  { component: Home, path: "/" },
  { component: Login, path: "/login", guestOnly: true },
  { component: Profile, path: "/profile" },
  { component: Register, path: "/register", guestOnly: true },
  {
    component: Product,
    path: "/products",
    children: [
      { component: AllProducts, path: "all" },
      { component: PublishedProducts, path: "published" },
      { component: UnpublishedProducts, path: "unpublished" },
      { component: HiddenProducts, path: "hidden" },
      { component: ViolationProducts, path: "violation" },
    ],
  },
  {
    component: Order,
    path: "/orders",
    children: [
      { component: All, path: "all" },
      { component: COMPLETED, path: "completed" },
      { component: Shipping, path: "shipping" },
      { component: Cancelled, path: "cancelled" },
    ],
  },
];

const privateRoutes = [];
export { publicRoutes, privateRoutes };
