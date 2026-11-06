// Batch recipes: few ingredients, oven / air fryer / Dutch oven, halal, no pork, no eggplant,
// fish only salmon or tuna, no drinking milk. Grams are raw weights for the whole batch.

export const RECIPES = Object.freeze([
  {
    id: 'honey_soy_chicken', kind: 'main', name: 'Honey-soy chicken thighs + rice', servings: 4,
    method: 'Toss thighs in honey, soy, oil, garlic. Air fry 200°C 18–20 min, turning once. Simmer leftover marinade 3 min as sauce. Rice + microwaved veg.',
    ingredients: [{ food: 'chicken_thigh', g: 1000 }, { food: 'honey', g: 60 }, { food: 'soy_sauce', g: 60 }, { food: 'olive_oil', g: 20 }, { food: 'rice', g: 400 }, { food: 'frozen_veg', g: 400 }],
  },
  {
    id: 'beef_chilli', kind: 'main', name: 'Beef & chickpea chilli + rice', servings: 5,
    method: 'Dutch oven: brown mince and onion, add tomatoes, chickpeas, chilli/cumin/paprika. Lid on, 160°C oven 60 min. Freezes well.',
    ingredients: [{ food: 'beef_mince', g: 1000 }, { food: 'onion', g: 200 }, { food: 'tomato_tin', g: 800 }, { food: 'chickpeas', g: 480 }, { food: 'olive_oil', g: 20 }, { food: 'rice', g: 500 }],
  },
  {
    id: 'harissa_lamb', kind: 'main', name: 'Slow harissa lamb + roast potatoes + yoghurt', servings: 5,
    method: 'Rub lamb with harissa + oil. Dutch oven, lid on, 150°C for 3 h, shred into its juices. Potatoes 200°C 40 min. Garlic yoghurt on top.',
    ingredients: [{ food: 'lamb_shoulder', g: 1200 }, { food: 'harissa', g: 80 }, { food: 'olive_oil', g: 20 }, { food: 'potato', g: 1200 }, { food: 'greek_yoghurt', g: 300 }],
  },
  {
    id: 'salmon_teriyaki', kind: 'main', name: 'Teriyaki salmon traybake + rice', servings: 3,
    method: 'Salmon pieces + teriyaki on a lined tray, 200°C 12–14 min (air fryer 180°C 10 min). Spoon pan sauce over rice and veg.',
    ingredients: [{ food: 'salmon', g: 600 }, { food: 'teriyaki', g: 120 }, { food: 'rice', g: 300 }, { food: 'frozen_veg', g: 300 }],
  },
  {
    id: 'tuna_pasta_bake', kind: 'main', name: 'Tuna tomato pasta bake', servings: 4,
    method: 'Par-cook pasta 2 min under. Mix with tomatoes, onion, tuna and its oil, chilli flakes. Baking dish, foil on, 190°C 25 min.',
    ingredients: [{ food: 'tuna_oil', g: 400 }, { food: 'pasta', g: 500 }, { food: 'tomato_tin', g: 800 }, { food: 'onion', g: 150 }, { food: 'olive_oil', g: 30 }],
  },
  {
    id: 'coconut_curry', kind: 'main', name: 'Coconut chicken curry + rice', servings: 5,
    method: 'Dutch oven: onion + curry paste, then thighs, coconut milk and veg. Lid on, 170°C oven 45 min. Thick, saucy, freezes well.',
    ingredients: [{ food: 'chicken_thigh', g: 1000 }, { food: 'coconut_milk', g: 400 }, { food: 'curry_paste', g: 100 }, { food: 'onion', g: 200 }, { food: 'rice', g: 400 }, { food: 'frozen_veg', g: 300 }],
  },
  {
    id: 'beef_ragu', kind: 'main', name: 'Slow beef ragu + pasta', servings: 6,
    method: 'Brown chuck chunks, add onion and tomatoes. Lid on, 150°C oven 3 h, shred with forks. Toss through pasta.',
    ingredients: [{ food: 'beef_chuck', g: 1200 }, { food: 'tomato_tin', g: 800 }, { food: 'onion', g: 200 }, { food: 'olive_oil', g: 20 }, { food: 'pasta', g: 600 }],
  },
  {
    id: 'peri_chicken', kind: 'main', name: 'Peri-peri chicken + sweet potato + hummus', servings: 4,
    method: 'Marinate thighs in peri-peri. Air fry 200°C 18 min. Sweet potato wedges in oil, 200°C 25 min. Hummus + extra sauce on the side.',
    ingredients: [{ food: 'chicken_thigh', g: 900 }, { food: 'peri_peri', g: 150 }, { food: 'olive_oil', g: 20 }, { food: 'sweet_potato', g: 900 }, { food: 'hummus', g: 200 }],
  },
  {
    id: 'lamb_kofta_wraps', kind: 'main', name: 'Lamb kofta wraps + garlic yoghurt', servings: 4,
    method: 'Mix mince, grated onion, cumin, salt. Shape 12 koftas. Air fry 200°C 10–12 min. Wraps, yoghurt sauce, lettuce, chilli.',
    ingredients: [{ food: 'lamb_mince', g: 800 }, { food: 'onion', g: 150 }, { food: 'wraps', g: 400 }, { food: 'greek_yoghurt', g: 300 }],
  },
  {
    id: 'beef_shakshuka', kind: 'main', name: 'Beef & egg shakshuka + wraps', servings: 4,
    method: 'Dutch oven: brown mince + onion, add tomatoes, cumin, paprika, chilli; simmer 10 min. Make 8 wells, crack in eggs. Oven 190°C 12–15 min. Scoop with warm wraps.',
    ingredients: [{ food: 'beef_mince', g: 500 }, { food: 'egg', g: 400 }, { food: 'tomato_tin', g: 800 }, { food: 'onion', g: 150 }, { food: 'olive_oil', g: 20 }, { food: 'wraps', g: 400 }],
  },
  {
    id: 'chicken_egg_fried_rice', kind: 'main', name: 'Chicken & egg fried rice', servings: 4,
    method: 'Cook rice ahead and chill. Air fry diced thighs 200°C 12 min. Big pan: oil, scramble eggs, add rice, veg, chicken, soy. Keeps 4 days in the fridge.',
    ingredients: [{ food: 'chicken_thigh', g: 600 }, { food: 'egg', g: 300 }, { food: 'rice', g: 400 }, { food: 'frozen_veg', g: 400 }, { food: 'soy_sauce', g: 60 }, { food: 'olive_oil', g: 30 }],
  },
  {
    id: 'big_shake', kind: 'shake', name: 'Big shake (oat-PB-banana)', servings: 1,
    method: 'Blend: 500 ml soy milk, oats, peanut butter, banana, 1 scoop whey, honey. Drink over 30 min if needed.',
    ingredients: [{ food: 'soy_milk', g: 500 }, { food: 'oats', g: 80 }, { food: 'peanut_butter', g: 40 }, { food: 'banana', g: 120 }, { food: 'whey', g: 30 }, { food: 'honey', g: 20 }],
  },
  {
    id: 'pb_honey_shake', kind: 'shake', name: 'PB-honey shake, no banana', servings: 1,
    method: 'Blend: 500 ml soy milk, oats, peanut butter, 1 scoop whey, double honey.',
    ingredients: [{ food: 'soy_milk', g: 500 }, { food: 'oats', g: 90 }, { food: 'peanut_butter', g: 45 }, { food: 'whey', g: 30 }, { food: 'honey', g: 45 }],
  },
  {
    id: 'lite_shake', kind: 'shake', name: 'Lighter shake', servings: 1,
    method: 'Blend: 400 ml soy milk, 1 scoop whey, banana, oats.',
    ingredients: [{ food: 'soy_milk', g: 400 }, { food: 'whey', g: 30 }, { food: 'banana', g: 120 }, { food: 'oats', g: 40 }],
  },
  {
    id: 'yoghurt_bowl', kind: 'snack', name: 'Greek yoghurt, nuts + honey', servings: 1,
    method: 'Bowl of yoghurt, handful of nuts, drizzle of honey.',
    ingredients: [{ food: 'greek_yoghurt', g: 250 }, { food: 'mixed_nuts', g: 40 }, { food: 'honey', g: 20 }],
  },
  {
    id: 'tuna_wrap', kind: 'snack', name: 'Tuna + hummus wrap', servings: 1,
    method: 'One small tin tuna in oil, hummus, 2 wraps.',
    ingredients: [{ food: 'tuna_oil', g: 95 }, { food: 'wraps', g: 100 }, { food: 'hummus', g: 50 }],
  },
  {
    id: 'pb_wrap', kind: 'snack', name: 'PB-honey-banana wrap + whey water', servings: 1,
    method: 'Wrap with peanut butter, honey, banana. Scoop of whey in water on the side.',
    ingredients: [{ food: 'wraps', g: 60 }, { food: 'peanut_butter', g: 30 }, { food: 'honey', g: 15 }, { food: 'banana', g: 120 }, { food: 'whey', g: 30 }],
  },
]);
