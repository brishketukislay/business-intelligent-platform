import Link from "next/link";

import {
  navigationItems,
} from "./navigation";


export function Sidebar() {

  return (

    <aside
  className="
    hidden
    min-h-screen
    w-64
    shrink-0
    border-r
    bg-white
    p-4
    md:block
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
