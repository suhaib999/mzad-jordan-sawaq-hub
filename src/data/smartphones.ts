
export interface SmartphoneModel {
  id: string;
  name: string;
  year: number;
  storageOptions?: string[];
  colorOptions?: string[];
}

export interface SmartphoneBrand {
  id: string;
  name: string;
  models: SmartphoneModel[];
}

export const smartphoneBrands: SmartphoneBrand[] = [
  {
    id: "apple",
    name: "Apple",
    models: [
      {
        id: "iphone-15-pro-max",
        name: "iPhone 15 Pro Max",
        year: 2023,
        storageOptions: ["128 GB", "256 GB", "512 GB", "1 TB"],
        colorOptions: ["Natural Titanium", "Blue Titanium", "White Titanium", "Black Titanium"]
      },
      {
        id: "iphone-15-pro",
        name: "iPhone 15 Pro",
        year: 2023,
        storageOptions: ["128 GB", "256 GB", "512 GB", "1 TB"],
        colorOptions: ["Natural Titanium", "Blue Titanium", "White Titanium", "Black Titanium"]
      },
      {
        id: "iphone-15-plus",
        name: "iPhone 15 Plus",
        year: 2023,
        storageOptions: ["128 GB", "256 GB", "512 GB"],
        colorOptions: ["Pink", "Yellow", "Green", "Blue", "Black"]
      },
      {
        id: "iphone-15",
        name: "iPhone 15",
        year: 2023,
        storageOptions: ["128 GB", "256 GB", "512 GB"],
        colorOptions: ["Pink", "Yellow", "Green", "Blue", "Black"]
      },
      {
        id: "iphone-14-pro-max",
        name: "iPhone 14 Pro Max",
        year: 2022,
        storageOptions: ["128 GB", "256 GB", "512 GB", "1 TB"],
        colorOptions: ["Deep Purple", "Gold", "Silver", "Space Black"]
      },
      {
        id: "iphone-14-pro",
        name: "iPhone 14 Pro",
        year: 2022,
        storageOptions: ["128 GB", "256 GB", "512 GB", "1 TB"],
        colorOptions: ["Deep Purple", "Gold", "Silver", "Space Black"]
      },
      {
        id: "iphone-14-plus",
        name: "iPhone 14 Plus",
        year: 2022,
        storageOptions: ["128 GB", "256 GB", "512 GB"],
        colorOptions: ["Midnight", "Starlight", "Blue", "Purple", "Red"]
      },
      {
        id: "iphone-14",
        name: "iPhone 14",
        year: 2022,
        storageOptions: ["128 GB", "256 GB", "512 GB"],
        colorOptions: ["Midnight", "Starlight", "Blue", "Purple", "Red"]
      },
      {
        id: "iphone-13-pro-max",
        name: "iPhone 13 Pro Max",
        year: 2021,
        storageOptions: ["128 GB", "256 GB", "512 GB", "1 TB"],
        colorOptions: ["Graphite", "Gold", "Silver", "Sierra Blue", "Alpine Green"]
      },
      // Add more iPhone models back to 2017
      {
        id: "iphone-x",
        name: "iPhone X",
        year: 2017,
        storageOptions: ["64 GB", "256 GB"],
        colorOptions: ["Silver", "Space Gray"]
      },
    ]
  },
  {
    id: "samsung",
    name: "Samsung",
    models: [
      {
        id: "galaxy-s24-ultra",
        name: "Galaxy S24 Ultra",
        year: 2024,
        storageOptions: ["256 GB", "512 GB", "1 TB"],
        colorOptions: ["Titanium Black", "Titanium Gray", "Titanium Violet", "Titanium Yellow"]
      },
      {
        id: "galaxy-s24-plus",
        name: "Galaxy S24+",
        year: 2024,
        storageOptions: ["256 GB", "512 GB"],
        colorOptions: ["Onyx Black", "Marble Gray", "Cobalt Violet", "Amber Yellow"]
      },
      {
        id: "galaxy-s24",
        name: "Galaxy S24",
        year: 2024,
        storageOptions: ["128 GB", "256 GB"],
        colorOptions: ["Onyx Black", "Marble Gray", "Cobalt Violet", "Amber Yellow"]
      },
      {
        id: "galaxy-s23-ultra",
        name: "Galaxy S23 Ultra",
        year: 2023,
        storageOptions: ["256 GB", "512 GB", "1 TB"],
        colorOptions: ["Phantom Black", "Cream", "Green", "Lavender"]
      },
      // Add more Samsung models back to 2017
      {
        id: "galaxy-s8",
        name: "Galaxy S8",
        year: 2017,
        storageOptions: ["64 GB"],
        colorOptions: ["Midnight Black", "Orchid Gray", "Arctic Silver", "Coral Blue"]
      },
    ]
  },
  {
    id: "google",
    name: "Google",
    models: [
      {
        id: "pixel-8-pro",
        name: "Pixel 8 Pro",
        year: 2023,
        storageOptions: ["128 GB", "256 GB", "512 GB"],
        colorOptions: ["Obsidian", "Porcelain", "Bay"]
      },
      {
        id: "pixel-8",
        name: "Pixel 8",
        year: 2023,
        storageOptions: ["128 GB", "256 GB"],
        colorOptions: ["Obsidian", "Hazel", "Rose"]
      },
      // Add more Google models back to 2017
    ]
  },
  {
    id: "xiaomi",
    name: "Xiaomi",
    models: [
      {
        id: "xiaomi-14-ultra",
        name: "Xiaomi 14 Ultra",
        year: 2024,
        storageOptions: ["256 GB", "512 GB", "1 TB"],
        colorOptions: ["Black", "White"]
      },
      // Add more Xiaomi models back to 2017
    ]
  },
  {
    id: "oneplus",
    name: "OnePlus",
    models: [
      {
        id: "oneplus-12",
        name: "OnePlus 12",
        year: 2024,
        storageOptions: ["256 GB", "512 GB"],
        colorOptions: ["Silky Black", "Flowy Emerald"]
      },
      // Add more OnePlus models back to 2017
    ]
  },
  {
    id: "huawei",
    name: "Huawei",
    models: [
      {
        id: "p60-pro",
        name: "P60 Pro",
        year: 2023,
        storageOptions: ["256 GB", "512 GB"],
        colorOptions: ["Rococo Pearl", "Black"]
      },
      // Add more Huawei models back to 2017
    ]
  }
];
