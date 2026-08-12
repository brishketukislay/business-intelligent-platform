import {
  BarChart3,
  LayoutDashboard,
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
    name: "Admin",
    href: "/admin/users",
    icon: Shield,
  },
];