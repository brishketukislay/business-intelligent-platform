// import {
//   LayoutDashboard,
//   Boxes,
//   Shield,
// } from "lucide-react";

// export const navigationItems = [
//   {
//     name: "Dashboard",
//     href: "/dashboard",
//     icon: LayoutDashboard,
//   },
//   {
//     name: "Models",
//     href: "/models",
//     icon: Boxes,
//   },
//   {
//     name: "Admin",
//     href: "/admin/users",
//     icon: Shield,
//   },
// ];
import {
  BarChart3,
  LayoutDashboard,
  Settings,
  Shield,
} from "lucide-react";

export const navigationItems = [
  {
    name: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Trackers",
    href: "/models",
    icon: BarChart3,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export const adminNavigationItems = [
  {
    name: "Users",
    href: "/admin/users",
    icon: Shield,
  },
];