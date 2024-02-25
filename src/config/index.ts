export const PRODUCT_CATEGORIES = [
    {
        label: "UI Kits",
        value: "ui_kits" as const,
        featured: [
            {
                name: "Editor picks",
                href: "#",
                imageSr: "/nav/ui-kits/mixed.jpg",
            },
            {
                name: "New Arrivals",
                href: "#",
                imageSr: "/nav/ui-kits/blue.jpg",
            },
            {
                name: "Bestsellers",
                href: "#",
                imageSr: "/nav/ui-kits/purple.jpg",
            },
        ],
    },
    {
        label: "Icons",
        value: "icons" as const,
        featured: [
            {
                name: "Favorite Icon Picks",
                href: "#",
                imageSr: "/nav/icons/picks.jpg",
            },
            {
                name: "New Arrivals",
                href: "#",
                imageSr: "/nav/icons/new.jpg",
            },
            {
                name: "Bestselling Icons",
                href: "#",
                imageSr: "/nav/icons/bestsellers.jpg",
            },
        ],
    },
]