import { RestaurantInfo, MenuTab } from "@/types";

export const sonCubanoInfo: RestaurantInfo = {
  name: "Son Cubano",
  slug: "son-cubano",
  description:
    "A vibrant Cuban restaurant offering authentic Latin cuisine with a modern twist, set along the Hudson River waterfront.",
  address: "40-4 Riverwalk Place, West New York, NJ 07093",
  phone: "(201) 399-2020",
  hours: [
    { day: "Mon-Thu", open: "12:00 PM", close: "10:00 PM" },
    { day: "Fri-Sat", open: "12:00 PM", close: "12:00 AM" },
    { day: "Sunday", open: "11:00 AM", close: "10:00 PM" },
  ],
  heroImage:
    "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1600&h=900&fit=crop",
  cuisine: "Cuban / Latin",
  priceRange: "$$",
};

export const sonCubanoMenu: MenuTab[] = [
  {
    id: "dinner",
    name: "Dinner",
    categories: [
      {
        id: "dinner-appetizers",
        name: "Appetizers",
        items: [
          {
            id: "d-app-1",
            name: "Butternut Squash Soup",
            description:
              "Creamy seasonal butternut squash soup with toasted pepitas",
            price: 14,
            tags: ["gf"],
            image:
              "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=400&h=300&fit=crop",
          },
          {
            id: "d-app-2",
            name: "Crab Croquettes",
            description:
              "Golden-fried crab croquettes with chipotle aioli",
            price: 20,
            tags: ["popular"],
            image:
              "https://images.unsplash.com/photo-1554520735-0a6b8b6ce8b7?w=400&h=300&fit=crop",
          },
          {
            id: "d-app-3",
            name: "Empanadas Mixtas",
            description:
              "Braised chicken, oxtail, spinach and Manchego",
            price: 18,
            tags: ["popular"],
            image:
              "https://images.unsplash.com/photo-1554520735-0a6b8b6ce8b7?w=400&h=300&fit=crop",
          },
          {
            id: "d-app-4",
            name: "Guacamole",
            description:
              "Freshly prepared tableside guacamole with tortilla chips",
            price: 16,
            tags: ["gf"],
            image:
              "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&h=300&fit=crop",
          },
          {
            id: "d-app-5",
            name: "Spicy Ceviche Mixto",
            description:
              "Fresh fish and shrimp ceviche with citrus and chili",
            price: 20,
            tags: ["spicy"],
            image:
              "https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?w=400&h=300&fit=crop",
          },
          {
            id: "d-app-6",
            name: "Tuna Tartar Tacos",
            description:
              "Crispy wonton shells with fresh tuna tartar and avocado",
            price: 20,
            image:
              "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400&h=300&fit=crop",
          },
          {
            id: "d-app-7",
            name: "Lobster and Shrimp Tacos",
            description:
              "Grilled lobster and shrimp in soft tortillas",
            price: 28,
            tags: ["popular"],
            image:
              "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop",
          },
          {
            id: "d-app-8",
            name: "Clothesline Bacon",
            description:
              "Thick-cut bacon with pickled pineapple and cracked black pepper",
            price: 22,
            tags: ["popular"],
            image:
              "https://images.unsplash.com/photo-1528607929212-2636ec44253e?w=400&h=300&fit=crop",
          },
          {
            id: "d-app-9",
            name: "East Coast Oysters",
            description:
              "Half dozen fresh oysters on the half shell with mignonette",
            price: 24,
            image:
              "https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?w=400&h=300&fit=crop",
          },
          {
            id: "d-app-10",
            name: "Pulpo a la Parilla",
            description:
              "Grilled octopus with roasted potatoes and chimichurri",
            price: 21,
            image:
              "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop",
          },
          {
            id: "d-app-11",
            name: "Steak Anticucho Skewers",
            description:
              "Grilled marinated steak skewers with aji amarillo",
            price: 23,
            image:
              "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop",
          },
        ],
      },
      {
        id: "dinner-entrees",
        name: "Entrees",
        items: [
          {
            id: "d-ent-1",
            name: "Ropa Vieja",
            description:
              "Slow-braised shredded flank steak in tomato sofrito with rice and beans",
            price: 38,
            tags: ["popular"],
            image:
              "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop",
          },
          {
            id: "d-ent-2",
            name: "Skirt Steak Churrasco",
            description:
              "12oz grilled skirt steak with chimichurri and yuca fries",
            price: 49,
            tags: ["popular"],
            image:
              "https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=300&fit=crop",
          },
          {
            id: "d-ent-3",
            name: "BBQ Glazed Salmon",
            description:
              "Atlantic salmon with guava BBQ glaze and seasonal vegetables",
            price: 30,
            image:
              "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop",
          },
          {
            id: "d-ent-4",
            name: "Grilled Bone-In Pork Chop",
            description:
              "14oz pork chop with mojo criollo and maduros",
            price: 35,
            image:
              "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop",
          },
          {
            id: "d-ent-5",
            name: "Roasted Chicken",
            description:
              "Half chicken with garlic mojo, black beans, and rice",
            price: 31,
            image:
              "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=300&fit=crop",
          },
          {
            id: "d-ent-6",
            name: "Catch of the Day",
            description:
              "Market fresh fish prepared with chef's daily preparation",
            price: 39,
            image:
              "https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=400&h=300&fit=crop",
          },
          {
            id: "d-ent-7",
            name: "Crackling Pork Shank",
            description:
              "Slow-roasted pork shank with crispy skin and plantain mash",
            price: 37,
            tags: ["popular"],
            image:
              "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop",
          },
          {
            id: "d-ent-8",
            name: "Filet Mignon Medallions",
            description:
              "Twin medallions with red wine reduction and truffle mash",
            price: 39,
            image:
              "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=400&h=300&fit=crop",
          },
          {
            id: "d-ent-9",
            name: "14oz Ribeye Steak",
            description:
              "Prime ribeye with garlic butter and roasted vegetables",
            price: 59,
            image:
              "https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=400&h=300&fit=crop",
          },
        ],
      },
      {
        id: "dinner-sides",
        name: "Sides",
        items: [
          {
            id: "d-side-1",
            name: "Yuca Fries",
            description: "Crispy fried yuca with garlic mojo dipping sauce",
            price: 9,
          },
          {
            id: "d-side-2",
            name: "Black Beans",
            description: "Slow-cooked Cuban-style black beans",
            price: 6,
          },
          {
            id: "d-side-3",
            name: "Maduros",
            description: "Sweet fried plantains",
            price: 7,
          },
          {
            id: "d-side-4",
            name: "White Rice",
            description: "Fluffy steamed white rice",
            price: 6,
          },
          {
            id: "d-side-5",
            name: "Arroz Moro",
            description: "Cuban rice and beans cooked together",
            price: 8,
          },
          {
            id: "d-side-6",
            name: "Tostones",
            description: "Twice-fried green plantains with garlic sauce",
            price: 6,
          },
          {
            id: "d-side-7",
            name: "Truffle Manchego & Herb Fries",
            description:
              "Crispy fries with truffle oil and aged Manchego",
            price: 10,
            tags: ["popular"],
          },
        ],
      },
      {
        id: "dinner-table-share",
        name: "Table Share",
        items: [
          {
            id: "d-ts-1",
            name: "Parrillada",
            description:
              "Mixed grill platter with steak, chicken, chorizo, and pork for the table",
            price: 128,
            image:
              "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop",
          },
          {
            id: "d-ts-2",
            name: "Paella Classic",
            description:
              "Traditional saffron rice with chicken, chorizo, shrimp, and mussels",
            price: 52,
            addOns: [{ name: "Add Lobster", price: 20 }],
            image:
              "https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=400&h=300&fit=crop",
          },
        ],
      },
    ],
  },
  {
    id: "brunch",
    name: "Brunch",
    categories: [
      {
        id: "brunch-sandwiches",
        name: "Sandwiches",
        items: [
          {
            id: "b-sand-1",
            name: "Cuban Sandwich",
            description:
              "Roasted pork, ham, Swiss, pickles, mustard on pressed Cuban bread",
            price: 14,
            tags: ["popular"],
            image:
              "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=300&fit=crop",
          },
          {
            id: "b-sand-2",
            name: "Dry Aged Burger",
            description:
              "8oz dry-aged beef patty with lettuce, tomato, and special sauce",
            price: 19,
            addOns: [
              { name: "Bacon", price: 4 },
              { name: "Fried Egg", price: 2 },
            ],
            image:
              "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop",
          },
          {
            id: "b-sand-3",
            name: "BLT Blackened Chicken Wrap",
            description:
              "Blackened chicken with bacon, lettuce, tomato in a flour tortilla",
            price: 18,
            image:
              "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop",
          },
        ],
      },
      {
        id: "brunch-entrees",
        name: "Entrees",
        items: [
          {
            id: "b-ent-1",
            name: "Huevos Rancheros",
            description:
              "Two eggs on crispy tortillas with ranchero sauce and avocado",
            price: 19,
            image:
              "https://images.unsplash.com/photo-1582169296194-e4d644c48063?w=400&h=300&fit=crop",
          },
          {
            id: "b-ent-2",
            name: "Crispy Buttermilk Chicken & French Toast",
            description:
              "Fried chicken on thick-cut French toast with maple syrup",
            price: 20,
            tags: ["popular"],
            image:
              "https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=400&h=300&fit=crop",
          },
          {
            id: "b-ent-3",
            name: "Steak and Eggs",
            description:
              "Grilled skirt steak with two eggs any style and breakfast potatoes",
            price: 29,
            image:
              "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&h=300&fit=crop",
          },
          {
            id: "b-ent-4",
            name: "Lobster Reyes",
            description:
              "Lobster eggs Benedict with hollandaise on brioche",
            price: 35,
            tags: ["popular"],
            image:
              "https://images.unsplash.com/photo-1608039829572-9b1234ef0d0f?w=400&h=300&fit=crop",
          },
        ],
      },
    ],
  },
  {
    id: "drinks",
    name: "Drinks",
    categories: [
      {
        id: "cocktails",
        name: "Signature Cocktails",
        items: [
          {
            id: "dr-1",
            name: "Classic Mojito",
            description: "White rum, fresh mint, lime, sugar, soda water",
            price: 16,
            image:
              "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400&h=300&fit=crop",
          },
          {
            id: "dr-2",
            name: "Son Cubano Old Fashioned",
            description:
              "Aged rum, demerara sugar, Angostura bitters, orange peel",
            price: 18,
            tags: ["popular"],
          },
          {
            id: "dr-3",
            name: "Spicy Mango Margarita",
            description:
              "Tequila, fresh mango, lime, Tajin rim, habanero",
            price: 17,
            tags: ["spicy"],
          },
          {
            id: "dr-4",
            name: "Havana Sunset",
            description:
              "Rum, passion fruit, pineapple, grenadine",
            price: 16,
          },
        ],
      },
    ],
  },
];

export function getRestaurantBySlug(slug: string) {
  if (slug === "son-cubano") {
    return { info: sonCubanoInfo, menu: sonCubanoMenu };
  }
  return null;
}
