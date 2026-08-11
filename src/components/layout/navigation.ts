import {
  LayoutDashboard,
  Boxes,
  Shield,
} from "lucide-react";

export const navigationItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Models",
    href: "/models",
    icon: Boxes,
  },
  {
    name: "Admin",
    href: "/admin/users",
    icon: Shield,
  },
];