import { Category } from "@/types/product";

export function findCategoryById(categories: Category[], id: string): Category | null {
  for (const category of categories) {
    if (category.id === id) {
      return category;
    }
    if (category.children) {
      const found = findCategoryById(category.children, id);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

export function findCategoryBySlug(categories: Category[], slug: string): Category | null {
  for (const category of categories) {
    if (category.slug === slug) {
      return category;
    }
    if (category.children) {
      const found = findCategoryBySlug(category.children, slug);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

export function getAllLeafCategories(categories: Category[]): Category[] {
  let leafCategories: Category[] = [];
  
  for (const category of categories) {
    if (category.is_leaf) {
      leafCategories.push(category);
    } else if (category.children) {
      leafCategories = [...leafCategories, ...getAllLeafCategories(category.children)];
    }
  }
  
  return leafCategories;
}

export function getCategoryPath(categories: Category[], categoryId: string): Category[] {
  const path: Category[] = [];
  
  function findPath(cats: Category[], id: string, currentPath: Category[]): boolean {
    for (const cat of cats) {
      const newPath = [...currentPath, cat];
      
      if (cat.id === id) {
        path.push(...newPath);
        return true;
      }
      
      if (cat.children && findPath(cat.children, id, newPath)) {
        return true;
      }
    }
    
    return false;
  }
  
  findPath(categories, categoryId, []);
  return path;
}

// Modified categories data - removing brands from phones subcategory
export const categories = [
  {
    id: "1",
    name: "Vehicles",
    slug: "vehicles",
    children: [
      {
        id: "1-1",
        name: "Cars",
        slug: "vehicles/cars",
        parent_id: "1",
        level: 1,
        is_leaf: true
      },
      {
        id: "1-2",
        name: "Motorcycles",
        slug: "vehicles/motorcycles",
        parent_id: "1",
        level: 1,
        is_leaf: true
      },
      {
        id: "1-3",
        name: "Boats",
        slug: "vehicles/boats",
        parent_id: "1",
        level: 1,
        is_leaf: true
      },
      {
        id: "1-4",
        name: "Heavy Vehicles",
        slug: "vehicles/heavy-vehicles",
        parent_id: "1",
        level: 1,
        is_leaf: true
      },
      {
        id: "1-5",
        name: "Vehicle Parts & Accessories",
        slug: "vehicles/parts-accessories",
        parent_id: "1",
        level: 1,
        is_leaf: true
      }
    ],
    level: 0
  },
  {
    id: "2",
    name: "Electronics",
    slug: "electronics",
    children: [
      {
        id: "2-1",
        name: "Mobile Phones & Tablets",
        slug: "electronics/mobile-phones-tablets",
        parent_id: "2",
        level: 1,
        children: [
          {
            id: "2-1-1",
            name: "Phones",
            slug: "electronics/mobile-phones-tablets/phones",
            parent_id: "2-1",
            level: 2,
            is_leaf: true
          },
          {
            id: "2-1-2",
            name: "Tablets",
            slug: "electronics/mobile-phones-tablets/tablets",
            parent_id: "2-1",
            level: 2,
            is_leaf: true
          },
          {
            id: "2-1-3",
            name: "Accessories",
            slug: "electronics/mobile-phones-tablets/accessories",
            parent_id: "2-1",
            level: 2,
            is_leaf: true
          }
        ]
      },
      {
        id: "2-2",
        name: "Computers & Laptops",
        slug: "electronics/computers-laptops",
        parent_id: "2",
        level: 1,
        children: [
          {
            id: "2-2-1",
            name: "Laptops",
            slug: "electronics/computers-laptops/laptops",
            parent_id: "2-2",
            level: 2,
            is_leaf: true
          },
          {
            id: "2-2-2",
            name: "Desktops",
            slug: "electronics/computers-laptops/desktops",
            parent_id: "2-2",
            level: 2,
            is_leaf: true
          },
          {
            id: "2-2-3",
            name: "Accessories",
            slug: "electronics/computers-laptops/accessories",
            parent_id: "2-2",
            level: 2,
            is_leaf: true
          }
        ]
      },
      {
        id: "2-3",
        name: "TV & Audio",
        slug: "electronics/tv-audio",
        parent_id: "2",
        level: 1,
        children: [
          {
            id: "2-3-1",
            name: "Televisions",
            slug: "electronics/tv-audio/televisions",
            parent_id: "2-3",
            level: 2,
            is_leaf: true
          },
          {
            id: "2-3-2",
            name: "Audio Systems",
            slug: "electronics/tv-audio/audio-systems",
            parent_id: "2-3",
            level: 2,
            is_leaf: true
          },
          {
            id: "2-3-3",
            name: "Accessories",
            slug: "electronics/tv-audio/accessories",
            parent_id: "2-3",
            level: 2,
            is_leaf: true
          }
        ]
      },
      {
        id: "2-4",
        name: "Cameras & Imaging",
        slug: "electronics/cameras-imaging",
        parent_id: "2",
        level: 1,
        children: [
          {
            id: "2-4-1",
            name: "Digital Cameras",
            slug: "electronics/cameras-imaging/digital-cameras",
            parent_id: "2-4",
            level: 2,
            is_leaf: true
          },
          {
            id: "2-4-2",
            name: "Video Cameras",
            slug: "electronics/cameras-imaging/video-cameras",
            parent_id: "2-4",
            level: 2,
            is_leaf: true
          },
          {
            id: "2-4-3",
            name: "Accessories",
            slug: "electronics/cameras-imaging/accessories",
            parent_id: "2-4",
            level: 2,
            is_leaf: true
          }
        ]
      },
      {
        id: "2-5",
        name: "Gaming",
        slug: "electronics/gaming",
        parent_id: "2",
        level: 1,
        children: [
          {
            id: "2-5-1",
            name: "Consoles",
            slug: "electronics/gaming/consoles",
            parent_id: "2-5",
            level: 2,
            is_leaf: true
          },
          {
            id: "2-5-2",
            name: "Games",
            slug: "electronics/gaming/games",
            parent_id: "2-5",
            level: 2,
            is_leaf: true
          },
          {
            id: "2-5-3",
            name: "Accessories",
            slug: "electronics/gaming/accessories",
            parent_id: "2-5",
            level: 2,
            is_leaf: true
          }
        ]
      }
    ],
    level: 0
  },
  {
    id: "3",
    name: "Home & Garden",
    slug: "home-garden",
    children: [
      {
        id: "3-1",
        name: "Furniture",
        slug: "home-garden/furniture",
        parent_id: "3",
        level: 1,
        is_leaf: true
      },
      {
        id: "3-2",
        name: "Home Appliances",
        slug: "home-garden/home-appliances",
        parent_id: "3",
        level: 1,
        is_leaf: true
      },
      {
        id: "3-3",
        name: "Kitchen & Dining",
        slug: "home-garden/kitchen-dining",
        parent_id: "3",
        level: 1,
        is_leaf: true
      },
      {
        id: "3-4",
        name: "Garden & Outdoor",
        slug: "home-garden/garden-outdoor",
        parent_id: "3",
        level: 1,
        is_leaf: true
      },
      {
        id: "3-5",
        name: "Home Decor",
        slug: "home-garden/home-decor",
        parent_id: "3",
        level: 1,
        is_leaf: true
      }
    ],
    level: 0
  },
  {
    id: "4",
    name: "Fashion & Beauty",
    slug: "fashion-beauty",
    children: [
      {
        id: "4-1",
        name: "Men's Clothing",
        slug: "fashion-beauty/mens-clothing",
        parent_id: "4",
        level: 1,
        is_leaf: true
      },
      {
        id: "4-2",
        name: "Women's Clothing",
        slug: "fashion-beauty/womens-clothing",
        parent_id: "4",
        level: 1,
        is_leaf: true
      },
      {
        id: "4-3",
        name: "Shoes",
        slug: "fashion-beauty/shoes",
        parent_id: "4",
        level: 1,
        is_leaf: true
      },
      {
        id: "4-4",
        name: "Bags & Accessories",
        slug: "fashion-beauty/bags-accessories",
        parent_id: "4",
        level: 1,
        is_leaf: true
      },
      {
        id: "4-5",
        name: "Beauty & Personal Care",
        slug: "fashion-beauty/beauty-personal-care",
        parent_id: "4",
        level: 1,
        is_leaf: true
      },
      {
        id: "4-6",
        name: "Jewelry & Watches",
        slug: "fashion-beauty/jewelry-watches",
        parent_id: "4",
        level: 1,
        is_leaf: true
      }
    ],
    level: 0
  },
  {
    id: "5",
    name: "Real Estate for Sale",
    slug: "real-estate-sale",
    children: [
      {
        id: "5-1",
        name: "Apartments for Sale",
        slug: "real-estate-sale/apartments",
        parent_id: "5",
        level: 1,
        is_leaf: true
      },
      {
        id: "5-2",
        name: "Houses for Sale",
        slug: "real-estate-sale/houses",
        parent_id: "5",
        level: 1,
        is_leaf: true
      },
      {
        id: "5-3",
        name: "Land for Sale",
        slug: "real-estate-sale/land",
        parent_id: "5",
        level: 1,
        is_leaf: true
      },
      {
        id: "5-4",
        name: "Commercial for Sale",
        slug: "real-estate-sale/commercial",
        parent_id: "5",
        level: 1,
        is_leaf: true
      }
    ],
    level: 0
  },
  {
    id: "6",
    name: "Real Estate for Rent",
    slug: "real-estate-rent",
    children: [
      {
        id: "6-1",
        name: "Apartments for Rent",
        slug: "real-estate-rent/apartments",
        parent_id: "6",
        level: 1,
        is_leaf: true
      },
      {
        id: "6-2",
        name: "Houses for Rent",
        slug: "real-estate-rent/houses",
        parent_id: "6",
        level: 1,
        is_leaf: true
      },
      {
        id: "6-3",
        name: "Commercial for Rent",
        slug: "real-estate-rent/commercial",
        parent_id: "6",
        level: 1,
        is_leaf: true
      },
      {
        id: "6-4",
        name: "Rooms for Rent",
        slug: "real-estate-rent/rooms",
        parent_id: "6",
        level: 1,
        is_leaf: true
      }
    ],
    level: 0
  },
  {
    id: "7",
    name: "Jobs",
    slug: "jobs",
    children: [
      {
        id: "7-1",
        name: "Full Time",
        slug: "jobs/full-time",
        parent_id: "7",
        level: 1,
        is_leaf: true
      },
      {
        id: "7-2",
        name: "Part Time",
        slug: "jobs/part-time",
        parent_id: "7",
        level: 1,
        is_leaf: true
      },
      {
        id: "7-3",
        name: "Temporary",
        slug: "jobs/temporary",
        parent_id: "7",
        level: 1,
        is_leaf: true
      },
      {
        id: "7-4",
        name: "Internship",
        slug: "jobs/internship",
        parent_id: "7",
        level: 1,
        is_leaf: true
      }
    ],
    level: 0
  },
  {
    id: "8",
    name: "Services",
    slug: "services",
    children: [
      {
        id: "8-1",
        name: "Home Services",
        slug: "services/home-services",
        parent_id: "8",
        level: 1,
        is_leaf: true
      },
      {
        id: "8-2",
        name: "Business Services",
        slug: "services/business-services",
        parent_id: "8",
        level: 1,
        is_leaf: true
      },
      {
        id: "8-3",
        name: "Health & Beauty",
        slug: "services/health-beauty",
        parent_id: "8",
        level: 1,
        is_leaf: true
      },
      {
        id: "8-4",
        name: "Education & Classes",
        slug: "services/education-classes",
        parent_id: "8",
        level: 1,
        is_leaf: true
      },
      {
        id: "8-5",
        name: "Events & Entertainment",
        slug: "services/events-entertainment",
        parent_id: "8",
        level: 1,
        is_leaf: true
      }
    ],
    level: 0
  },
  {
    id: "9",
    name: "Pets",
    slug: "pets",
    children: [
      {
        id: "9-1",
        name: "Dogs",
        slug: "pets/dogs",
        parent_id: "9",
        level: 1,
        is_leaf: true
      },
      {
        id: "9-2",
        name: "Cats",
        slug: "pets/cats",
        parent_id: "9",
        level: 1,
        is_leaf: true
      },
      {
        id: "9-3",
        name: "Birds",
        slug: "pets/birds",
        parent_id: "9",
        level: 1,
        is_leaf: true
      },
      {
        id: "9-4",
        name: "Fish",
        slug: "pets/fish",
        parent_id: "9",
        level: 1,
        is_leaf: true
      },
      {
        id: "9-5",
        name: "Pet Supplies",
        slug: "pets/pet-supplies",
        parent_id: "9",
        level: 1,
        is_leaf: true
      }
    ],
    level: 0
  },
  {
    id: "10",
    name: "Sports & Leisure",
    slug: "sports-leisure",
    children: [
      {
        id: "10-1",
        name: "Sports Equipment",
        slug: "sports-leisure/sports-equipment",
        parent_id: "10",
        level: 1,
        is_leaf: true
      },
      {
        id: "10-2",
        name: "Bicycles",
        slug: "sports-leisure/bicycles",
        parent_id: "10",
        level: 1,
        is_leaf: true
      },
      {
        id: "10-3",
        name: "Camping & Hiking",
        slug: "sports-leisure/camping-hiking",
        parent_id: "10",
        level: 1,
        is_leaf: true
      },
      {
        id: "10-4",
        name: "Musical Instruments",
        slug: "sports-leisure/musical-instruments",
        parent_id: "10",
        level: 1,
        is_leaf: true
      },
      {
        id: "10-5",
        name: "Books & Magazines",
        slug: "sports-leisure/books-magazines",
        parent_id: "10",
        level: 1,
        is_leaf: true
      }
    ],
    level: 0
  }
];

export default categories;
