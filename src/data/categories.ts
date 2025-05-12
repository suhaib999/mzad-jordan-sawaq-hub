export interface Category {
  id: string;
  name: string;
  slug: string;
  children?: Category[];
}

export interface CategoryBreadcrumb {
  id: string;
  name: string;
  slug: string;
}

export const categories: Category[] = [
  {
    id: "electronics",
    name: "Electronics",
    slug: "electronics",
    children: [
      {
        id: "mobile-phones-tablets",
        name: "Mobile Phones & Tablets",
        slug: "electronics/mobile-phones-tablets",
        children: [
          { 
            id: "phones", 
            name: "Phones", 
            slug: "electronics/mobile-phones-tablets/phones",
            children: [
              { id: "apple", name: "Apple", slug: "electronics/mobile-phones-tablets/phones/apple" },
              { id: "samsung", name: "Samsung", slug: "electronics/mobile-phones-tablets/phones/samsung" },
              { id: "xiaomi", name: "Xiaomi", slug: "electronics/mobile-phones-tablets/phones/xiaomi" },
              { id: "huawei", name: "Huawei", slug: "electronics/mobile-phones-tablets/phones/huawei" },
              { id: "other-phones", name: "Other Brands", slug: "electronics/mobile-phones-tablets/phones/other" }
            ]
          },
          { id: "tablets", name: "Tablets", slug: "electronics/mobile-phones-tablets/tablets" },
          { id: "smart-watches", name: "Smart Watches", slug: "electronics/mobile-phones-tablets/smart-watches" },
          { id: "headphones", name: "Headphones", slug: "electronics/mobile-phones-tablets/headphones" },
          { id: "screen-protectors", name: "Screen Protectors & Cases", slug: "electronics/mobile-phones-tablets/screen-protectors" },
          { id: "chargers-cables", name: "Chargers & Cables", slug: "electronics/mobile-phones-tablets/chargers-cables" },
          { id: "spare-parts", name: "Mobile & Tablet Spare Parts", slug: "electronics/mobile-phones-tablets/spare-parts" },
          { id: "mobile-accessories", name: "Accessories", slug: "electronics/mobile-phones-tablets/accessories" },
          { id: "special-phone-numbers", name: "Special Phone Numbers", slug: "electronics/mobile-phones-tablets/special-phone-numbers" }
        ]
      },
      {
        id: "computers-laptops",
        name: "Computers & Laptops",
        slug: "electronics/computers-laptops",
        children: [
          { id: "laptops", name: "Laptops", slug: "electronics/computers-laptops/laptops" },
          { id: "desktops", name: "Desktop Computers", slug: "electronics/computers-laptops/desktops" },
          { id: "computer-parts", name: "Computer Parts", slug: "electronics/computers-laptops/computer-parts" },
          { id: "monitors", name: "Monitors", slug: "electronics/computers-laptops/monitors" },
          { id: "printers", name: "Printers & Scanners", slug: "electronics/computers-laptops/printers" },
          { id: "computer-accessories", name: "Computer Accessories", slug: "electronics/computers-laptops/computer-accessories" }
        ]
      },
      {
        id: "tv-audio",
        name: "TV & Audio",
        slug: "electronics/tv-audio",
        children: [
          { id: "tvs", name: "Televisions", slug: "electronics/tv-audio/tvs" },
          { id: "home-theater", name: "Home Theater Systems", slug: "electronics/tv-audio/home-theater" },
          { id: "speakers", name: "Speakers", slug: "electronics/tv-audio/speakers" },
          { id: "projectors", name: "Projectors", slug: "electronics/tv-audio/projectors" }
        ]
      },
      { 
        id: "cameras", 
        name: "Cameras & Photography", 
        slug: "electronics/cameras",
        children: [
          { id: "digital-cameras", name: "Digital Cameras", slug: "electronics/cameras/digital-cameras" },
          { id: "video-cameras", name: "Video Cameras", slug: "electronics/cameras/video-cameras" },
          { id: "lenses", name: "Camera Lenses", slug: "electronics/cameras/lenses" },
          { id: "camera-accessories", name: "Camera Accessories", slug: "electronics/cameras/camera-accessories" }
        ]
      },
      { id: "gaming", name: "Gaming & Consoles", slug: "electronics/gaming" }
    ]
  },
  {
    id: "vehicles",
    name: "Vehicles",
    slug: "vehicles",
    children: [
      { id: "cars", name: "Cars", slug: "vehicles/cars" },
      { id: "motorcycles", name: "Motorcycles", slug: "vehicles/motorcycles" },
      { id: "trucks", name: "Trucks", slug: "vehicles/trucks" },
      { id: "car-parts", name: "Car Parts & Accessories", slug: "vehicles/car-parts" }
    ]
  },
  {
    id: "games-toys",
    name: "Video Games & Kids",
    slug: "games-toys",
    children: [
      { id: "video-games", name: "Video Games", slug: "games-toys/video-games" },
      { id: "consoles", name: "Gaming Consoles", slug: "games-toys/consoles" },
      { id: "toys", name: "Toys", slug: "games-toys/toys" }
    ]
  },
  {
    id: "real-estate-sale",
    name: "Real Estate",
    slug: "real-estate-sale",
    children: [
      { id: "apartments-sale", name: "Apartments for Sale", slug: "real-estate-sale/apartments" },
      { id: "houses-sale", name: "Houses for Sale", slug: "real-estate-sale/houses" },
      { id: "land-sale", name: "Land for Sale", slug: "real-estate-sale/land" },
      { id: "commercial-sale", name: "Commercial for Sale", slug: "real-estate-sale/commercial" }
    ]
  },
  {
    id: "real-estate-rent",
    name: "Real Estate for Rent",
    slug: "real-estate-rent",
    children: [
      { id: "apartments-rent", name: "Apartments for Rent", slug: "real-estate-rent/apartments" },
      { id: "houses-rent", name: "Houses for Rent", slug: "real-estate-rent/houses" },
      { id: "commercial-rent", name: "Commercial for Rent", slug: "real-estate-rent/commercial" }
    ]
  },
  {
    id: "home-garden",
    name: "Home & Garden",
    slug: "home-garden",
    children: [
      { id: "furniture", name: "Furniture", slug: "home-garden/furniture" },
      { id: "appliances", name: "Appliances", slug: "home-garden/appliances" },
      { id: "kitchen", name: "Kitchen", slug: "home-garden/kitchen" },
      { id: "garden", name: "Garden & Outdoor", slug: "home-garden/garden" }
    ]
  },
  {
    id: "womens-fashion",
    name: "Women's Fashion",
    slug: "womens-fashion",
    children: [
      { id: "womens-clothing", name: "Women's Clothing", slug: "womens-fashion/clothing" },
      { id: "womens-shoes", name: "Women's Shoes", slug: "womens-fashion/shoes" },
      { id: "bags", name: "Bags & Purses", slug: "womens-fashion/bags" },
      { id: "jewelry", name: "Jewelry & Accessories", slug: "womens-fashion/jewelry" }
    ]
  },
  {
    id: "mens-fashion",
    name: "Men's Fashion",
    slug: "mens-fashion",
    children: [
      { id: "mens-clothing", name: "Men's Clothing", slug: "mens-fashion/clothing" },
      { id: "mens-shoes", name: "Men's Shoes", slug: "mens-fashion/shoes" },
      { id: "mens-accessories", name: "Men's Accessories", slug: "mens-fashion/accessories" }
    ]
  },
  {
    id: "baby-supplies",
    name: "Baby Supplies & Toys",
    slug: "baby-supplies",
    children: [
      { id: "baby-clothing", name: "Baby Clothing", slug: "baby-supplies/clothing" },
      { id: "baby-gear", name: "Baby Gear", slug: "baby-supplies/gear" },
      { id: "baby-toys", name: "Baby Toys", slug: "baby-supplies/toys" }
    ]
  },
  {
    id: "food-groceries",
    name: "Food & Groceries",
    slug: "food-groceries",
    children: [
      { id: "packaged-food", name: "Packaged Food", slug: "food-groceries/packaged" },
      { id: "beverages", name: "Beverages", slug: "food-groceries/beverages" },
      { id: "specialty-food", name: "Specialty Food", slug: "food-groceries/specialty" }
    ]
  },
  {
    id: "education",
    name: "Education & Training",
    slug: "education",
    children: [
      { id: "courses", name: "Courses", slug: "education/courses" },
      { id: "textbooks", name: "Textbooks", slug: "education/textbooks" },
      { id: "tutoring", name: "Tutoring", slug: "education/tutoring" }
    ]
  },
  {
    id: "services",
    name: "Services",
    slug: "services",
    children: [
      { id: "home-services", name: "Home Services", slug: "services/home" },
      { id: "professional-services", name: "Professional Services", slug: "services/professional" },
      { id: "events", name: "Events & Entertainment", slug: "services/events" }
    ]
  },
  {
    id: "jobs",
    name: "Jobs",
    slug: "jobs",
    children: [
      { id: "full-time", name: "Full-time", slug: "jobs/full-time" },
      { id: "part-time", name: "Part-time", slug: "jobs/part-time" },
      { id: "freelance", name: "Freelance", slug: "jobs/freelance" }
    ]
  },
  {
    id: "animals",
    name: "Animals for Sale",
    slug: "animals",
    children: [
      { id: "pets", name: "Pets", slug: "animals/pets" },
      { id: "livestock", name: "Livestock", slug: "animals/livestock" },
      { id: "pet-supplies", name: "Pet Supplies", slug: "animals/supplies" }
    ]
  },
  {
    id: "books-hobbies",
    name: "Books & Hobbies",
    slug: "books-hobbies",
    children: [
      { id: "books", name: "Books", slug: "books-hobbies/books" },
      { id: "music", name: "Music & Instruments", slug: "books-hobbies/music" },
      { id: "collectibles", name: "Collectibles", slug: "books-hobbies/collectibles" },
      { id: "arts-crafts", name: "Arts & Crafts", slug: "books-hobbies/arts" }
    ]
  },
  {
    id: "sports-fitness",
    name: "Sports & Fitness",
    slug: "sports-fitness",
    children: [
      { id: "sporting-goods", name: "Sporting Goods", slug: "sports-fitness/goods" },
      { id: "fitness-equipment", name: "Fitness Equipment", slug: "sports-fitness/equipment" },
      { id: "outdoor-recreation", name: "Outdoor Recreation", slug: "sports-fitness/outdoor" }
    ]
  },
  {
    id: "business-equipment",
    name: "Business Equipment",
    slug: "business-equipment",
    children: [
      { id: "office-furniture", name: "Office Furniture", slug: "business-equipment/furniture" },
      { id: "office-supplies", name: "Office Supplies", slug: "business-equipment/supplies" },
      { id: "industrial", name: "Industrial Equipment", slug: "business-equipment/industrial" }
    ]
  }
];

export const findCategoryBySlug = (slug: string): Category | undefined => {
  const findInCategories = (cats: Category[]): Category | undefined => {
    for (const cat of cats) {
      if (cat.slug === slug) {
        return cat;
      }
      if (cat.children) {
        const found = findInCategories(cat.children);
        if (found) return found;
      }
    }
    return undefined;
  };
  
  return findInCategories(categories);
};

export const findCategoryById = (id: string): Category | undefined => {
  const findInCategories = (cats: Category[]): Category | undefined => {
    for (const cat of cats) {
      if (cat.id === id) {
        return cat;
      }
      if (cat.children) {
        const found = findInCategories(cat.children);
        if (found) return found;
      }
    }
    return undefined;
  };
  
  return findInCategories(categories);
};

export const buildCategoryPath = (categoryId: string): CategoryBreadcrumb[] => {
  const result: CategoryBreadcrumb[] = [];
  
  const findPath = (cats: Category[], path: CategoryBreadcrumb[] = []): boolean => {
    for (const cat of cats) {
      const currentPath = [...path, { id: cat.id, name: cat.name, slug: cat.slug }];
      
      if (cat.id === categoryId) {
        result.push(...currentPath);
        return true;
      }
      
      if (cat.children && findPath(cat.children, currentPath)) {
        return true;
      }
    }
    
    return false;
  };
  
  findPath(categories);
  return result;
};

export const searchCategories = (query: string): Category[] => {
  const results: Category[] = [];
  const normalizedQuery = query.toLowerCase();
  
  const searchInCategories = (cats: Category[]): void => {
    for (const cat of cats) {
      if (cat.name.toLowerCase().includes(normalizedQuery)) {
        results.push(cat);
      }
      
      if (cat.children) {
        searchInCategories(cat.children);
      }
    }
  };
  
  searchInCategories(categories);
  return results;
};
