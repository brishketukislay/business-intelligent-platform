import {
  LayoutDashboard,
  Boxes,
  Database,
  ChartBar,
  GitBranch,
  Shield,
  Settings,
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
    name: "Inputs",
    href: "/inputs",
    icon: Database,
  },
  {
    name: "Metrics",
    href: "/metrics",
    icon: ChartBar,
  },
  {
    name: "Scenarios",
    href: "/scenarios",
    icon: GitBranch,
  },
  {
    name: "Admin",
    href: "/admin/inputs",
    icon: Shield,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];
