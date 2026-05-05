export interface FoodItem {
  name: string;
  cuisine: string;
  kcalMin: number;
  kcalMax: number;
  tags: string[];
}

export const FOODS: FoodItem[] = [
  // Singapore / Hawker
  { name: "Chicken Rice", cuisine: "Singaporean", kcalMin: 550, kcalMax: 750, tags: ["Lunch", "Meat"] },
  { name: "Char Kway Teow", cuisine: "Singaporean", kcalMin: 700, kcalMax: 900, tags: ["Fried", "Lunch"] },
  { name: "Hokkien Mee", cuisine: "Singaporean", kcalMin: 600, kcalMax: 850, tags: ["Lunch", "Fried"] },
  { name: "Laksa", cuisine: "Singaporean", kcalMin: 550, kcalMax: 800, tags: ["Spicy", "Dairy"] },
  { name: "Bak Kut Teh", cuisine: "Singaporean", kcalMin: 450, kcalMax: 700, tags: ["Meat", "Dinner"] },
  { name: "Roti Prata", cuisine: "Singaporean", kcalMin: 300, kcalMax: 500, tags: ["Breakfast", "Fried"] },
  { name: "Nasi Lemak", cuisine: "Singaporean", kcalMin: 600, kcalMax: 900, tags: ["Spicy", "Breakfast"] },
  { name: "Satay (10 sticks)", cuisine: "Singaporean", kcalMin: 500, kcalMax: 700, tags: ["Meat"] },
  { name: "Kaya Toast Set", cuisine: "Singaporean", kcalMin: 350, kcalMax: 500, tags: ["Breakfast", "Sugar"] },
  { name: "Fish Ball Noodles", cuisine: "Singaporean", kcalMin: 400, kcalMax: 550, tags: ["Lunch", "Fish"] },
  { name: "Wanton Mee", cuisine: "Singaporean", kcalMin: 500, kcalMax: 700, tags: ["Lunch", "Meat"] },
  { name: "Carrot Cake (Chai Tow Kway)", cuisine: "Singaporean", kcalMin: 500, kcalMax: 750, tags: ["Fried", "Breakfast"] },
  { name: "Yong Tau Foo", cuisine: "Singaporean", kcalMin: 350, kcalMax: 600, tags: ["Lunch", "Veg"] },
  { name: "Mee Goreng", cuisine: "Singaporean", kcalMin: 600, kcalMax: 850, tags: ["Spicy", "Fried"] },

  // Chinese
  { name: "Wonton Soup", cuisine: "Chinese", kcalMin: 250, kcalMax: 400, tags: ["Meat"] },
  { name: "Sweet & Sour Pork", cuisine: "Chinese", kcalMin: 600, kcalMax: 900, tags: ["Meat", "Sugar", "Fried"] },
  { name: "Kung Pao Chicken", cuisine: "Chinese", kcalMin: 500, kcalMax: 750, tags: ["Spicy", "Meat"] },
  { name: "Mapo Tofu", cuisine: "Chinese", kcalMin: 400, kcalMax: 600, tags: ["Spicy"] },
  { name: "Dim Sum (4 pieces)", cuisine: "Chinese", kcalMin: 250, kcalMax: 450, tags: ["Breakfast"] },
  { name: "Fried Rice", cuisine: "Chinese", kcalMin: 500, kcalMax: 800, tags: ["Fried", "Lunch"] },
  { name: "Dumplings (8 pieces)", cuisine: "Chinese", kcalMin: 400, kcalMax: 600, tags: ["Meat"] },
  { name: "Beef Noodles", cuisine: "Chinese", kcalMin: 500, kcalMax: 750, tags: ["Meat", "Lunch"] },
  { name: "Hot Pot (per serving)", cuisine: "Chinese", kcalMin: 700, kcalMax: 1200, tags: ["Spicy", "Dinner"] },
  { name: "Char Siu Rice", cuisine: "Chinese", kcalMin: 600, kcalMax: 850, tags: ["Meat", "Lunch"] },
  { name: "Congee", cuisine: "Chinese", kcalMin: 200, kcalMax: 400, tags: ["Breakfast", "LowFiber"] },

  // Malay / Indonesian
  { name: "Nasi Padang", cuisine: "Malay", kcalMin: 700, kcalMax: 1100, tags: ["Spicy", "Meat"] },
  { name: "Mee Rebus", cuisine: "Malay", kcalMin: 500, kcalMax: 700, tags: ["Spicy", "Lunch"] },
  { name: "Mee Soto", cuisine: "Malay", kcalMin: 400, kcalMax: 600, tags: ["Lunch"] },
  { name: "Beef Rendang", cuisine: "Malay", kcalMin: 600, kcalMax: 900, tags: ["Spicy", "Meat"] },
  { name: "Gado Gado", cuisine: "Malay", kcalMin: 400, kcalMax: 600, tags: ["Veg", "HighFiber"] },
  { name: "Ayam Penyet", cuisine: "Malay", kcalMin: 700, kcalMax: 1000, tags: ["Spicy", "Fried", "Meat"] },
  { name: "Lontong", cuisine: "Malay", kcalMin: 450, kcalMax: 650, tags: ["Veg", "Breakfast"] },

  // Indian
  { name: "Chicken Biryani", cuisine: "Indian", kcalMin: 700, kcalMax: 1000, tags: ["Spicy", "Meat"] },
  { name: "Butter Chicken with Naan", cuisine: "Indian", kcalMin: 800, kcalMax: 1200, tags: ["Spicy", "Dairy", "Meat"] },
  { name: "Dal Tadka", cuisine: "Indian", kcalMin: 300, kcalMax: 500, tags: ["HighFiber", "Veg"] },
  { name: "Chana Masala", cuisine: "Indian", kcalMin: 350, kcalMax: 550, tags: ["HighFiber", "Spicy", "Veg"] },
  { name: "Palak Paneer", cuisine: "Indian", kcalMin: 400, kcalMax: 650, tags: ["Veg", "Dairy"] },
  { name: "Masala Dosa", cuisine: "Indian", kcalMin: 400, kcalMax: 600, tags: ["Breakfast", "Spicy"] },
  { name: "Tandoori Chicken", cuisine: "Indian", kcalMin: 400, kcalMax: 600, tags: ["Spicy", "Meat"] },
  { name: "Samosa (2 pieces)", cuisine: "Indian", kcalMin: 250, kcalMax: 400, tags: ["Fried", "Snack"] },
  { name: "Roti Canai", cuisine: "Indian", kcalMin: 300, kcalMax: 500, tags: ["Breakfast", "Fried"] },
  { name: "Fish Curry", cuisine: "Indian", kcalMin: 400, kcalMax: 650, tags: ["Spicy", "Fish"] },

  // Western
  { name: "Cheeseburger & Fries", cuisine: "Western", kcalMin: 800, kcalMax: 1200, tags: ["Meat", "Fried", "Dairy"] },
  { name: "Caesar Salad", cuisine: "Western", kcalMin: 350, kcalMax: 600, tags: ["Veg", "Dairy"] },
  { name: "Grilled Chicken Breast", cuisine: "Western", kcalMin: 250, kcalMax: 400, tags: ["Meat", "LowFiber"] },
  { name: "Steak (8oz)", cuisine: "Western", kcalMin: 500, kcalMax: 800, tags: ["Meat", "Dinner"] },
  { name: "Fish & Chips", cuisine: "Western", kcalMin: 800, kcalMax: 1200, tags: ["Fried", "Fish"] },
  { name: "BLT Sandwich", cuisine: "Western", kcalMin: 450, kcalMax: 650, tags: ["Lunch", "Meat"] },
  { name: "Avocado Toast", cuisine: "Western", kcalMin: 300, kcalMax: 500, tags: ["Breakfast", "HighFiber"] },
  { name: "Greek Salad", cuisine: "Western", kcalMin: 250, kcalMax: 450, tags: ["Veg", "Dairy", "HighFiber"] },
  { name: "Roast Chicken Dinner", cuisine: "Western", kcalMin: 600, kcalMax: 900, tags: ["Meat", "Dinner"] },
  { name: "Pancakes (Stack of 3)", cuisine: "Western", kcalMin: 500, kcalMax: 800, tags: ["Breakfast", "Sugar"] },

  // Italian
  { name: "Spaghetti Carbonara", cuisine: "Italian", kcalMin: 700, kcalMax: 1000, tags: ["Dairy", "Meat"] },
  { name: "Margherita Pizza", cuisine: "Italian", kcalMin: 600, kcalMax: 900, tags: ["Dairy", "Gluten"] },
  { name: "Pepperoni Pizza", cuisine: "Italian", kcalMin: 700, kcalMax: 1100, tags: ["Dairy", "Meat", "Gluten"] },
  { name: "Lasagna", cuisine: "Italian", kcalMin: 600, kcalMax: 900, tags: ["Meat", "Dairy", "Gluten"] },
  { name: "Risotto", cuisine: "Italian", kcalMin: 500, kcalMax: 800, tags: ["Dairy", "Dinner"] },
  { name: "Tiramisu", cuisine: "Italian", kcalMin: 400, kcalMax: 600, tags: ["Dairy", "Sugar", "Caffeine"] },
  { name: "Minestrone", cuisine: "Italian", kcalMin: 200, kcalMax: 400, tags: ["Veg", "HighFiber"] },
  { name: "Bolognese Pasta", cuisine: "Italian", kcalMin: 600, kcalMax: 900, tags: ["Meat", "Gluten"] },
  { name: "Pesto Pasta", cuisine: "Italian", kcalMin: 550, kcalMax: 800, tags: ["Dairy", "Gluten"] },

  // Korean
  { name: "Bibimbap", cuisine: "Korean", kcalMin: 500, kcalMax: 750, tags: ["Veg", "HighFiber"] },
  { name: "Korean BBQ (per serving)", cuisine: "Korean", kcalMin: 700, kcalMax: 1200, tags: ["Meat", "Dinner"] },
  { name: "Kimchi Stew", cuisine: "Korean", kcalMin: 350, kcalMax: 550, tags: ["Spicy", "Veg"] },
  { name: "Tteokbokki", cuisine: "Korean", kcalMin: 500, kcalMax: 750, tags: ["Spicy", "Sugar"] },
  { name: "Japchae", cuisine: "Korean", kcalMin: 400, kcalMax: 600, tags: ["Veg"] },
  { name: "Bulgogi", cuisine: "Korean", kcalMin: 500, kcalMax: 750, tags: ["Meat", "Sugar"] },
  { name: "Sundubu Jjigae", cuisine: "Korean", kcalMin: 350, kcalMax: 550, tags: ["Spicy"] },
  { name: "Korean Fried Chicken", cuisine: "Korean", kcalMin: 700, kcalMax: 1100, tags: ["Fried", "Meat"] },

  // Japanese
  { name: "Salmon Sashimi (8 pieces)", cuisine: "Japanese", kcalMin: 200, kcalMax: 350, tags: ["Fish", "LowFiber"] },
  { name: "Tonkotsu Ramen", cuisine: "Japanese", kcalMin: 700, kcalMax: 1100, tags: ["Meat", "Dinner"] },
  { name: "Chicken Katsu Curry", cuisine: "Japanese", kcalMin: 700, kcalMax: 1000, tags: ["Fried", "Meat"] },
  { name: "Sushi Set (10 pieces)", cuisine: "Japanese", kcalMin: 400, kcalMax: 700, tags: ["Fish", "Lunch"] },
  { name: "Tempura Udon", cuisine: "Japanese", kcalMin: 600, kcalMax: 900, tags: ["Fried", "Lunch"] },
  { name: "Miso Soup", cuisine: "Japanese", kcalMin: 60, kcalMax: 120, tags: ["LowFiber"] },
  { name: "Onigiri", cuisine: "Japanese", kcalMin: 180, kcalMax: 280, tags: ["Snack", "Breakfast"] },
  { name: "Beef Donburi", cuisine: "Japanese", kcalMin: 600, kcalMax: 900, tags: ["Meat", "Lunch"] },
  { name: "Tonkatsu", cuisine: "Japanese", kcalMin: 700, kcalMax: 1000, tags: ["Fried", "Meat"] },
  { name: "Edamame", cuisine: "Japanese", kcalMin: 100, kcalMax: 200, tags: ["HighFiber", "Veg", "Snack"] },

  // Snacks & drinks
  { name: "Bubble Tea", cuisine: "Drink", kcalMin: 300, kcalMax: 500, tags: ["Sugar", "Dairy"] },
  { name: "Iced Latte", cuisine: "Drink", kcalMin: 100, kcalMax: 250, tags: ["Caffeine", "Dairy"] },
  { name: "Black Coffee", cuisine: "Drink", kcalMin: 0, kcalMax: 10, tags: ["Caffeine"] },
  { name: "Beer (1 pint)", cuisine: "Drink", kcalMin: 180, kcalMax: 250, tags: ["Alcohol"] },
  { name: "Glass of Wine", cuisine: "Drink", kcalMin: 120, kcalMax: 200, tags: ["Alcohol"] },
  { name: "Banana", cuisine: "Snack", kcalMin: 90, kcalMax: 130, tags: ["Fruit", "HighFiber"] },
  { name: "Apple", cuisine: "Snack", kcalMin: 80, kcalMax: 120, tags: ["Fruit", "HighFiber"] },
  { name: "Greek Yogurt", cuisine: "Snack", kcalMin: 120, kcalMax: 200, tags: ["Dairy"] },
  { name: "Mixed Nuts (handful)", cuisine: "Snack", kcalMin: 150, kcalMax: 250, tags: ["Snack", "HighFiber"] },
  { name: "Oatmeal Bowl", cuisine: "Western", kcalMin: 250, kcalMax: 450, tags: ["Breakfast", "HighFiber", "Oats"] },

  // ── More Singaporean / Asian street food ──────────────────────────────────
  { name: "Spring Roll (2 pieces)", cuisine: "Singaporean", kcalMin: 150, kcalMax: 280, tags: ["Fried", "Snack"] },
  { name: "Oyster Omelette (Orh Luak)", cuisine: "Singaporean", kcalMin: 400, kcalMax: 650, tags: ["Fried", "Eggs"] },
  { name: "Prawn Mee (Hae Mee)", cuisine: "Singaporean", kcalMin: 500, kcalMax: 750, tags: ["Lunch", "Fish"] },
  { name: "Hainanese Porridge", cuisine: "Singaporean", kcalMin: 300, kcalMax: 500, tags: ["Breakfast", "LowFiber"] },
  { name: "Ice Kacang", cuisine: "Singaporean", kcalMin: 200, kcalMax: 400, tags: ["Sugar", "Snack"] },
  { name: "Popiah (2 pieces)", cuisine: "Singaporean", kcalMin: 180, kcalMax: 320, tags: ["Snack", "Veg"] },
  { name: "Kueh (2 pieces)", cuisine: "Singaporean", kcalMin: 150, kcalMax: 280, tags: ["Snack", "Sugar"] },

  // ── More Chinese ──────────────────────────────────────────────────────────
  { name: "Peking Duck", cuisine: "Chinese", kcalMin: 600, kcalMax: 900, tags: ["Meat", "Dinner"] },
  { name: "Char Siu Bao (3 pieces)", cuisine: "Chinese", kcalMin: 300, kcalMax: 450, tags: ["Breakfast", "Meat"] },
  { name: "Xiao Long Bao (6 pieces)", cuisine: "Chinese", kcalMin: 250, kcalMax: 400, tags: ["Meat", "Snack"] },
  { name: "Mapo Eggplant", cuisine: "Chinese", kcalMin: 300, kcalMax: 500, tags: ["Spicy", "Veg"] },

  // ── Thai ──────────────────────────────────────────────────────────────────
  { name: "Pad Thai", cuisine: "Thai", kcalMin: 500, kcalMax: 800, tags: ["Fried", "Lunch"] },
  { name: "Tom Yum Soup", cuisine: "Thai", kcalMin: 150, kcalMax: 300, tags: ["Spicy", "Soup"] },
  { name: "Green Curry", cuisine: "Thai", kcalMin: 450, kcalMax: 700, tags: ["Spicy", "Dairy"] },
  { name: "Som Tum (Papaya Salad)", cuisine: "Thai", kcalMin: 100, kcalMax: 200, tags: ["Spicy", "Veg", "HighFiber"] },
  { name: "Mango Sticky Rice", cuisine: "Thai", kcalMin: 350, kcalMax: 550, tags: ["Sugar", "Fruit"] },

  // ── Vietnamese ────────────────────────────────────────────────────────────
  { name: "Pho (Beef)", cuisine: "Vietnamese", kcalMin: 450, kcalMax: 700, tags: ["Meat", "Lunch"] },
  { name: "Banh Mi", cuisine: "Vietnamese", kcalMin: 400, kcalMax: 600, tags: ["Lunch", "Meat"] },
  { name: "Goi Cuon (Fresh Spring Roll)", cuisine: "Vietnamese", kcalMin: 120, kcalMax: 220, tags: ["Snack", "Veg"] },

  // ── More Japanese ─────────────────────────────────────────────────────────
  { name: "Gyoza (6 pieces)", cuisine: "Japanese", kcalMin: 200, kcalMax: 350, tags: ["Fried", "Meat"] },
  { name: "Takoyaki (6 pieces)", cuisine: "Japanese", kcalMin: 200, kcalMax: 350, tags: ["Snack", "Fried"] },
  { name: "Matcha Latte", cuisine: "Japanese", kcalMin: 120, kcalMax: 250, tags: ["Caffeine", "Dairy"] },
  { name: "Karaage Chicken", cuisine: "Japanese", kcalMin: 400, kcalMax: 650, tags: ["Fried", "Meat"] },

  // ── More Western ──────────────────────────────────────────────────────────
  { name: "Hot Dog", cuisine: "Western", kcalMin: 300, kcalMax: 500, tags: ["Meat", "Snack"] },
  { name: "Waffles", cuisine: "Western", kcalMin: 400, kcalMax: 700, tags: ["Breakfast", "Sugar"] },
  { name: "French Toast", cuisine: "Western", kcalMin: 350, kcalMax: 550, tags: ["Breakfast", "Sugar"] },
  { name: "Scrambled Eggs", cuisine: "Western", kcalMin: 200, kcalMax: 400, tags: ["Breakfast", "Eggs"] },
  { name: "Grilled Salmon", cuisine: "Western", kcalMin: 350, kcalMax: 550, tags: ["Fish", "Dinner"] },
  { name: "Club Sandwich", cuisine: "Western", kcalMin: 500, kcalMax: 750, tags: ["Lunch", "Meat"] },
  { name: "Burrito", cuisine: "Western", kcalMin: 600, kcalMax: 900, tags: ["Meat", "Lunch"] },
  { name: "Tacos (3 pieces)", cuisine: "Western", kcalMin: 400, kcalMax: 700, tags: ["Meat", "Spicy"] },
  { name: "Mac & Cheese", cuisine: "Western", kcalMin: 500, kcalMax: 800, tags: ["Dairy", "Gluten"] },

  // ── Desserts & more snacks ────────────────────────────────────────────────
  { name: "Donut", cuisine: "Snack", kcalMin: 250, kcalMax: 450, tags: ["Sugar", "Snack"] },
  { name: "Ice Cream (1 scoop)", cuisine: "Snack", kcalMin: 150, kcalMax: 300, tags: ["Sugar", "Dairy"] },
  { name: "Chocolate Cake", cuisine: "Snack", kcalMin: 350, kcalMax: 600, tags: ["Sugar", "Dairy"] },
  { name: "Mango", cuisine: "Snack", kcalMin: 80, kcalMax: 130, tags: ["Fruit", "HighFiber"] },
  { name: "Orange", cuisine: "Snack", kcalMin: 50, kcalMax: 90, tags: ["Fruit", "HighFiber"] },
  { name: "Watermelon Slice", cuisine: "Snack", kcalMin: 50, kcalMax: 100, tags: ["Fruit", "Sugar"] },
  { name: "Cheesecake", cuisine: "Snack", kcalMin: 350, kcalMax: 550, tags: ["Sugar", "Dairy"] },
  { name: "Açaí Bowl", cuisine: "Snack", kcalMin: 300, kcalMax: 600, tags: ["Fruit", "HighFiber", "Sugar"] },
];

export function searchFoods(query: string, limit = 30): FoodItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return FOODS.slice(0, limit);
  return FOODS.filter(
    (f) => f.name.toLowerCase().includes(q) || f.cuisine.toLowerCase().includes(q)
  ).slice(0, limit);
}