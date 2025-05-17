export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  subcategories?: Category[];
}

export const categoriesData: Category[] = [
  {
    id: '1',
    name: 'Vehicles',
    slug: 'vehicles',
    image: '/images/categories/vehicles.jpg',
    description: 'Find cars, motorcycles, and other vehicles for sale.',
    subcategories: [
      {
        id: '1-1',
        name: 'Cars',
        slug: 'cars',
        image: '/images/categories/cars.jpg',
        description: 'Buy and sell new and used cars.',
      },
      {
        id: '1-2',
        name: 'Motorcycles',
        slug: 'motorcycles',
        image: '/images/categories/motorcycles.jpg',
        description: 'Find motorcycles, scooters, and related accessories.',
      },
      {
        id: '1-3',
        name: 'Boats',
        slug: 'boats',
        image: '/images/categories/boats.jpg',
        description: 'Buy and sell boats, yachts, and marine equipment.',
      },
      {
        id: '1-4',
        name: 'Other Vehicles',
        slug: 'other-vehicles',
        description: 'Trucks, vans, buses, and other commercial vehicles.',
      },
    ],
  },
  {
    id: '2',
    name: 'Real Estate',
    slug: 'real-estate',
    image: '/images/categories/real-estate.jpg',
    description: 'Find properties for sale or rent.',
    subcategories: [
      {
        id: '2-1',
        name: 'Apartments',
        slug: 'apartments',
        description: 'Apartments for sale or rent.',
      },
      {
        id: '2-2',
        name: 'Houses',
        slug: 'houses',
        description: 'Houses for sale or rent.',
      },
      {
        id: '2-3',
        name: 'Land',
        slug: 'land',
        description: 'Land for sale.',
      },
      {
        id: '2-4',
        name: 'Commercial Property',
        slug: 'commercial-property',
        description: 'Offices, retail spaces, and other commercial properties.',
      },
    ],
  },
  {
    id: '3',
    name: 'Electronics',
    slug: 'electronics',
    image: '/images/categories/electronics.jpg',
    description: 'Buy and sell electronics and gadgets.',
    subcategories: [
      {
        id: '3-1',
        name: 'Computers',
        slug: 'computers',
        description: 'Desktops, laptops, and accessories.',
      },
      {
        id: '3-2',
        name: 'Phones',
        slug: 'phones',
        description: 'Smartphones and accessories.',
      },
      {
        id: '3-3',
        name: 'Tablets',
        slug: 'tablets',
        description: 'iPads, Android tablets, and accessories.',
      },
      {
        id: '3-4',
        name: 'Cameras',
        slug: 'cameras',
        description: 'Digital cameras, lenses, and accessories.',
      },
      {
        id: '3-5',
        name: 'TV & Video',
        slug: 'tv-video',
        description: 'Televisions, projectors, and accessories.',
      },
      {
        id: '3-6',
        name: 'Audio',
        slug: 'audio',
        description: 'Headphones, speakers, and audio equipment.',
      },
      {
        id: '3-7',
        name: 'Wearables',
        slug: 'wearables',
        description: 'Smartwatches, fitness trackers, and accessories.',
      },
      {
        id: '3-8',
        name: 'Home Appliances',
        slug: 'home-appliances',
        description: 'Refrigerators, washing machines, and other appliances.',
      },
    ],
  },
  {
    id: '4',
    name: 'Fashion',
    slug: 'fashion',
    image: '/images/categories/fashion.jpg',
    description: 'Buy and sell clothing, shoes, and accessories.',
    subcategories: [
      {
        id: '4-1',
        name: 'Clothing',
        slug: 'clothing',
        description: "Men's and women's clothing.",
      },
      {
        id: '4-2',
        name: 'Shoes',
        slug: 'shoes',
        description: "Men's and women's shoes.",
      },
      {
        id: '4-3',
        name: 'Accessories',
        slug: 'accessories',
        description: 'Jewelry, watches, and other accessories.',
      },
    ],
  },
  {
    id: '5',
    name: 'Home & Garden',
    slug: 'home-garden',
    image: '/images/categories/home-garden.jpg',
    description: 'Find furniture, decor, and gardening supplies.',
    subcategories: [
      {
        id: '5-1',
        name: 'Furniture',
        slug: 'furniture',
        description: 'Sofas, tables, chairs, and other furniture.',
      },
      {
        id: '5-2',
        name: 'Home Decor',
        slug: 'home-decor',
        description: 'Wall art, lighting, and other decor.',
      },
      {
        id: '5-3',
        name: 'Garden',
        slug: 'garden',
        description: 'Gardening tools, plants, and outdoor furniture.',
      },
    ],
  },
  {
    id: '6',
    name: 'Services',
    slug: 'services',
    image: '/images/categories/services.jpg',
    description: 'Find local services.',
    subcategories: [
      {
        id: '6-1',
        name: 'Home Services',
        slug: 'home-services',
        description: 'Cleaning, repairs, and other home services.',
      },
      {
        id: '6-2',
        name: 'Professional Services',
        slug: 'professional-services',
        description: 'Legal, accounting, and other professional services.',
      },
      {
        id: '6-3',
        name: 'Creative Services',
        slug: 'creative-services',
        description: 'Design, writing, and other creative services.',
      },
    ],
  },
  {
    id: '7',
    name: 'Jobs',
    slug: 'jobs',
    image: '/images/categories/jobs.jpg',
    description: 'Find job opportunities.',
  },
  {
    id: '8',
    name: 'Other',
    slug: 'other',
    image: '/images/categories/other.jpg',
    description: 'Miscellaneous items that don\'t fit into other categories.',
  },
];

export const buildCategoryPath = (categoryId: string): Category[] => {
  const path: Category[] = [];

  const findCategoryInTree = (
    categoryId: string,
    categories: Category[],
    currentPath: Category[] = []
  ): boolean => {
    for (const category of categories) {
      const newPath = [...currentPath, category];
      if (category.id === categoryId) {
        path.push(...newPath);
        return true;
      }
      if (category.subcategories && category.subcategories.length > 0) {
        if (findCategoryInTree(categoryId, category.subcategories, newPath)) {
          return true;
        }
      }
    }
    return false;
  };

  findCategoryInTree(categoryId, categoriesData);
  return path;
};

// Find category by ID
export const findCategoryById = (categoryId: string, categories: Category[] = categoriesData): Category | null => {
  // First check if any category at this level matches the ID
  const foundCategory = categories.find(category => category.id === categoryId);
  if (foundCategory) {
    return foundCategory;
  }

  // If not found at this level, recursively search in subcategories
  for (const category of categories) {
    if (category.subcategories && category.subcategories.length > 0) {
      const foundInSubcategories = findCategoryById(categoryId, category.subcategories);
      if (foundInSubcategories) {
        return foundInSubcategories;
      }
    }
  }

  return null;
};
