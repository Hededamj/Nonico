import { create } from "zustand";
import { supabase } from "../supabase";

interface Pet {
  id: string;
  user_id: string;
  name: string;
  health: number;
  happiness: number;
  hunger: number;
  outfit: string | null;
  accessories: string[];
  is_alive: boolean;
  last_fed: string;
  last_interaction: string;
}

interface InventoryItem {
  id: string;
  item_type: "food" | "outfit" | "accessory";
  item_id: string;
  quantity: number;
}

interface PetState {
  pet: Pet | null;
  inventory: InventoryItem[];
  isLoading: boolean;
  fetchPet: (userId: string) => Promise<void>;
  createPet: (userId: string, name: string) => Promise<{ error: Error | null }>;
  feedPet: (foodId: string) => Promise<void>;
  petNico: () => Promise<void>;
  updateOutfit: (outfitId: string | null) => Promise<void>;
  addAccessory: (accessoryId: string) => Promise<void>;
  removeAccessory: (accessoryId: string) => Promise<void>;
  decreaseStats: () => void;
  makeSick: () => Promise<void>;
  revive: () => Promise<void>;
  fetchInventory: (userId: string) => Promise<void>;
  addToInventory: (
    userId: string,
    itemType: "food" | "outfit" | "accessory",
    itemId: string,
    quantity: number
  ) => Promise<void>;
}

// Food items that can be earned
export const FOOD_ITEMS = {
  apple: { id: "apple", name: "Apple", nameDA: "Æble", healthBoost: 10, hungerBoost: 20 },
  carrot: { id: "carrot", name: "Carrot", nameDA: "Gulerod", healthBoost: 5, hungerBoost: 15 },
  cake: { id: "cake", name: "Cake", nameDA: "Kage", healthBoost: 0, hungerBoost: 30, happinessBoost: 20 },
  salad: { id: "salad", name: "Salad", nameDA: "Salat", healthBoost: 15, hungerBoost: 25 },
  smoothie: { id: "smoothie", name: "Smoothie", nameDA: "Smoothie", healthBoost: 20, hungerBoost: 10, happinessBoost: 10 },
};

// Outfits that can be earned
export const OUTFITS = {
  superhero: { id: "superhero", name: "Superhero Cape", nameDA: "Superhelte kappe", daysRequired: 7 },
  crown: { id: "crown", name: "Golden Crown", nameDA: "Gylden krone", daysRequired: 30 },
  wizard: { id: "wizard", name: "Wizard Hat", nameDA: "Troldmandshat", daysRequired: 14 },
  sunglasses: { id: "sunglasses", name: "Cool Sunglasses", nameDA: "Seje solbriller", daysRequired: 3 },
};

export const usePetStore = create<PetState>((set, get) => ({
  pet: null,
  inventory: [],
  isLoading: false,

  fetchPet: async (userId) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from("pet")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      set({ pet: data as Pet | null });
    } catch (error) {
      console.error("Error fetching pet:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  createPet: async (userId, name) => {
    try {
      const newPet = {
        user_id: userId,
        name,
        health: 100,
        happiness: 100,
        hunger: 100,
        outfit: null,
        accessories: [],
        is_alive: true,
        last_fed: new Date().toISOString(),
        last_interaction: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("pet")
        .insert(newPet)
        .select()
        .single();

      if (error) throw error;
      set({ pet: data as Pet });
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  },

  feedPet: async (foodId) => {
    const { pet, inventory } = get();
    if (!pet || !pet.is_alive) return;

    const food = FOOD_ITEMS[foodId as keyof typeof FOOD_ITEMS];
    if (!food) return;

    // Check if user has the food
    const inventoryItem = inventory.find(
      (item) => item.item_type === "food" && item.item_id === foodId
    );
    if (!inventoryItem || inventoryItem.quantity <= 0) return;

    const newHealth = Math.min(100, pet.health + (food.healthBoost || 0));
    const newHunger = Math.min(100, pet.hunger + food.hungerBoost);
    const newHappiness = Math.min(
      100,
      pet.happiness + ((food as any).happinessBoost || 5)
    );

    try {
      await supabase
        .from("pet")
        .update({
          health: newHealth,
          hunger: newHunger,
          happiness: newHappiness,
          last_fed: new Date().toISOString(),
        })
        .eq("id", pet.id);

      // Decrease inventory
      await supabase
        .from("pet_inventory")
        .update({ quantity: inventoryItem.quantity - 1 })
        .eq("id", inventoryItem.id);

      set({
        pet: {
          ...pet,
          health: newHealth,
          hunger: newHunger,
          happiness: newHappiness,
          last_fed: new Date().toISOString(),
        },
        inventory: inventory.map((item) =>
          item.id === inventoryItem.id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        ),
      });
    } catch (error) {
      console.error("Error feeding pet:", error);
    }
  },

  petNico: async () => {
    const { pet } = get();
    if (!pet || !pet.is_alive) return;

    const newHappiness = Math.min(100, pet.happiness + 15);

    try {
      await supabase
        .from("pet")
        .update({
          happiness: newHappiness,
          last_interaction: new Date().toISOString(),
        })
        .eq("id", pet.id);

      set({
        pet: {
          ...pet,
          happiness: newHappiness,
          last_interaction: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Error petting Nico:", error);
    }
  },

  updateOutfit: async (outfitId) => {
    const { pet } = get();
    if (!pet) return;

    try {
      await supabase.from("pet").update({ outfit: outfitId }).eq("id", pet.id);

      set({ pet: { ...pet, outfit: outfitId } });
    } catch (error) {
      console.error("Error updating outfit:", error);
    }
  },

  addAccessory: async (accessoryId) => {
    const { pet } = get();
    if (!pet) return;

    const newAccessories = [...pet.accessories, accessoryId];

    try {
      await supabase
        .from("pet")
        .update({ accessories: newAccessories })
        .eq("id", pet.id);

      set({ pet: { ...pet, accessories: newAccessories } });
    } catch (error) {
      console.error("Error adding accessory:", error);
    }
  },

  removeAccessory: async (accessoryId) => {
    const { pet } = get();
    if (!pet) return;

    const newAccessories = pet.accessories.filter((a) => a !== accessoryId);

    try {
      await supabase
        .from("pet")
        .update({ accessories: newAccessories })
        .eq("id", pet.id);

      set({ pet: { ...pet, accessories: newAccessories } });
    } catch (error) {
      console.error("Error removing accessory:", error);
    }
  },

  decreaseStats: () => {
    const { pet } = get();
    if (!pet || !pet.is_alive) return;

    // Calculate time since last interaction
    const lastInteraction = new Date(pet.last_interaction);
    const hoursSinceInteraction =
      (Date.now() - lastInteraction.getTime()) / (1000 * 60 * 60);

    // Decrease stats based on time
    const hungerDecrease = Math.floor(hoursSinceInteraction * 2);
    const happinessDecrease = Math.floor(hoursSinceInteraction * 1.5);

    const newHunger = Math.max(0, pet.hunger - hungerDecrease);
    const newHappiness = Math.max(0, pet.happiness - happinessDecrease);

    // Health decreases if hunger or happiness is very low
    let healthDecrease = 0;
    if (newHunger < 20) healthDecrease += 5;
    if (newHappiness < 20) healthDecrease += 3;

    const newHealth = Math.max(0, pet.health - healthDecrease);
    const isAlive = newHealth > 0;

    set({
      pet: {
        ...pet,
        hunger: newHunger,
        happiness: newHappiness,
        health: newHealth,
        is_alive: isAlive,
      },
    });
  },

  makeSick: async () => {
    const { pet } = get();
    if (!pet) return;

    // Significantly reduce health when user uses nicotine
    const newHealth = Math.max(0, pet.health - 30);
    const newHappiness = Math.max(0, pet.happiness - 40);
    const isAlive = newHealth > 0;

    try {
      await supabase
        .from("pet")
        .update({
          health: newHealth,
          happiness: newHappiness,
          is_alive: isAlive,
        })
        .eq("id", pet.id);

      set({
        pet: {
          ...pet,
          health: newHealth,
          happiness: newHappiness,
          is_alive: isAlive,
        },
      });
    } catch (error) {
      console.error("Error making pet sick:", error);
    }
  },

  revive: async () => {
    const { pet } = get();
    if (!pet || pet.is_alive) return;

    // Revive with reduced stats
    try {
      await supabase
        .from("pet")
        .update({
          health: 50,
          happiness: 50,
          hunger: 50,
          is_alive: true,
        })
        .eq("id", pet.id);

      set({
        pet: {
          ...pet,
          health: 50,
          happiness: 50,
          hunger: 50,
          is_alive: true,
        },
      });
    } catch (error) {
      console.error("Error reviving pet:", error);
    }
  },

  fetchInventory: async (userId) => {
    try {
      const { data, error } = await supabase
        .from("pet_inventory")
        .select("*")
        .eq("user_id", userId);

      if (error) throw error;
      set({ inventory: data as InventoryItem[] });
    } catch (error) {
      console.error("Error fetching inventory:", error);
    }
  },

  addToInventory: async (userId, itemType, itemId, quantity) => {
    const { inventory } = get();
    const existingItem = inventory.find(
      (item) => item.item_type === itemType && item.item_id === itemId
    );

    try {
      if (existingItem) {
        await supabase
          .from("pet_inventory")
          .update({ quantity: existingItem.quantity + quantity })
          .eq("id", existingItem.id);

        set({
          inventory: inventory.map((item) =>
            item.id === existingItem.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
        });
      } else {
        const { data, error } = await supabase
          .from("pet_inventory")
          .insert({
            user_id: userId,
            item_type: itemType,
            item_id: itemId,
            quantity,
            acquired_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;
        set({ inventory: [...inventory, data as InventoryItem] });
      }
    } catch (error) {
      console.error("Error adding to inventory:", error);
    }
  },
}));
