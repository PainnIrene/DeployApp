import { AccountLayout } from "../layout";

// Pages
import Home from "../pages/Home";
import Profile from "../pages/Profile";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Payment from "../pages/Payment";
import Address from "../pages/Address";
import ChangePassword from "../pages/ChangePassword";
import NotificationSettings from "../pages/NotificationSettings";
import UserSettings from "../pages/UserSettings";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import VerifyEmail from "../pages/VerifyEmail";
import ChangeEmail from "../pages/ChangeEmail";
import ProductDetails from "../pages/ProductDetails";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";
import Orders from "../pages/Orders";
import OrderDetails from "../pages/OrderDetails";
import Search from "../pages/Search";
// Public routes
const publicRoutes = [
  { component: Home, path: "/" },
  { component: Orders, path: "/orders" },
  {
    component: Profile,
    path: "/profile",
    layout: AccountLayout,
    requiredLogin: true,
  },
  { component: Search, path: "/search" },
  {
    component: Payment,
    path: "/payment",
    layout: AccountLayout,
    requiredLogin: true,
  },
  {
    component: Address,
    path: "/address",
    layout: AccountLayout,
    requiredLogin: true,
  },
  {
    component: ChangePassword,
    path: "/changepass",
    layout: AccountLayout,
    requiredLogin: true,
  },
  {
    component: NotificationSettings,
    path: "/notisettings",
    layout: AccountLayout,
    requiredLogin: true,
  },
  {
    component: UserSettings,
    path: "/usersettings",
    layout: AccountLayout,
    requiredLogin: true,
  },
  { component: Login, path: "/login", guestOnly: true },
  { component: Register, path: "/register", guestOnly: true },
  { component: ForgotPassword, path: "/forgotpassword", guestOnly: true },
  { component: ResetPassword, path: "/resetpassword", guestOnly: true },
  { component: VerifyEmail, path: "/verifyEmailByURL" },
  { component: ChangeEmail, path: "/changeEmailByURL" },
  { component: ProductDetails, path: "/product/:id" },
  {
    component: Cart,
    path: "/cart",
    requiredLogin: true,
  },
  {
    component: Checkout,
    path: "/checkout",
    requiredLogin: true,
  },
  {
    component: OrderDetails,
    path: "/order/:orderId",
    requiredLogin: true,
  },
];

const privateRoutes = [];
export { publicRoutes, privateRoutes };
