import Link from "next/link";

import {
  navigationItems,
} from "./navigation";


export function Sidebar() {

  return (

    <aside
      className="
        w-64
        border-r
        bg-white
        min-h-screen
        p-4
      "
    >

      <div
        className="
          mb-8
          text-xl
          font-semibold
        "
      >
        BI Modelling
      </div>


      <nav
        className="
          space-y-2
        "
      >

        {
          navigationItems.map(
            (item) => {

              const Icon = item.icon;


              return (

                <Link
                  key={item.name}
                  href={item.href}
                  className="
                    flex
                    items-center
                    gap-3
                    rounded-md
                    px-3
                    py-2
                    text-sm
                    hover:bg-gray-100
                  "
                >

                  <Icon
                    size={18}
                  />

                  <span>
                    {item.name}
                  </span>

                </Link>

              );

            }
          )
        }

      </nav>

    </aside>

  );
}
