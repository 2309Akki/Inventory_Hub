import React, { createContext, useContext, useState, useEffect } from 'react';

const InventoryContext = createContext();

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};

export const InventoryProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedItems = localStorage.getItem('inventoryItems');
    if (storedItems) {
      setItems(JSON.parse(storedItems));
    } else {
      const sampleItems = [
        // Laptops
        {
          id: '1',
          name: 'Laptop Dell XPS 15',
          sku: 'LP-DEL-001',
          quantity: 15,
          price: 1299.99,
          category: 'Laptops',
          description: 'High-performance laptop with 15.6" display, Intel i7 processor, 16GB RAM, 512GB SSD',
          image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300',
          availability: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'MacBook Pro 14"',
          sku: 'LP-MAC-002',
          quantity: 8,
          price: 1999.99,
          category: 'Laptops',
          description: 'Apple MacBook Pro with M2 Pro chip, 16GB RAM, 512GB SSD, 14" Liquid Retina XDR display',
          image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300',
          availability: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '3',
          name: 'HP Spectre x360',
          sku: 'LP-HP-003',
          quantity: 12,
          price: 1149.99,
          category: 'Laptops',
          description: '2-in-1 convertible laptop with 13.3" touchscreen, Intel i5, 8GB RAM, 256GB SSD',
          image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300',
          availability: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '4',
          name: 'Lenovo ThinkPad X1',
          sku: 'LP-LEN-004',
          quantity: 6,
          price: 1599.99,
          category: 'Laptops',
          description: 'Business laptop with 14" display, Intel i7, 16GB RAM, 1TB SSD, military-grade durability',
          image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=300',
          availability: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '5',
          name: 'ASUS ROG Zephyrus',
          sku: 'LP-ASU-005',
          quantity: 4,
          price: 1799.99,
          category: 'Laptops',
          description: 'Gaming laptop with 15.6" 144Hz display, AMD Ryzen 9, 32GB RAM, 1TB SSD, RTX 3070',
          image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=300',
          availability: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '6',
          name: 'Surface Laptop 4',
          sku: 'LP-MS-006',
          quantity: 10,
          price: 1299.99,
          category: 'Laptops',
          description: 'Microsoft Surface Laptop with 13.5" touchscreen, AMD Ryzen 7, 16GB RAM, 512GB SSD',
          image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300',
          availability: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '19',
          name: 'Acer Swift 3',
          sku: 'LP-ACE-007',
          quantity: 18,
          price: 749.99,
          category: 'Laptops',
          description: 'Ultrabook with 14" Full HD display, AMD Ryzen 5, 8GB RAM, 256GB SSD, thin and light',
          image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=300',
          availability: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '20',
          name: 'MSI Creator 15',
          sku: 'LP-MSI-008',
          quantity: 7,
          price: 1899.99,
          category: 'Laptops',
          description: 'Content creation laptop with 15.6" 4K display, Intel i9, 32GB RAM, 1TB SSD, RTX 3060',
          image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300',
          availability: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '21',
          name: 'Razer Blade 15',
          sku: 'LP-RAZ-009',
          quantity: 5,
          price: 2199.99,
          category: 'Laptops',
          description: 'Premium gaming laptop with 15.6" 240Hz display, Intel i7, 16GB RAM, 1TB SSD, RTX 3080',
          image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=300',
          availability: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '22',
          name: 'LG Gram 17',
          sku: 'LP-LG-010',
          quantity: 9,
          price: 1399.99,
          category: 'Laptops',
          description: 'Lightweight 17" laptop with Intel i7, 16GB RAM, 512GB SSD, only 2.98 lbs',
          image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=300',
          availability: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '23',
          name: 'Microsoft Surface Book 3',
          sku: 'LP-MSB-011',
          quantity: 11,
          price: 1699.99,
          category: 'Laptops',
          description: '2-in-1 detachable laptop with 13.5" touchscreen, Intel i7, 16GB RAM, 256GB SSD',
          image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300',
          availability: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        // Phones
        {
          id: '7',
          name: 'iPhone 14 Pro',
          sku: 'PH-APP-001',
          quantity: 25,
          price: 999.99,
          category: 'Phones',
          description: 'Apple iPhone 14 Pro with 6.1" display, A16 Bionic chip, 128GB storage, Pro camera system',
          image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300',
          availability: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '8',
          name: 'Samsung Galaxy S23',
          sku: 'PH-SAM-002',
          quantity: 18,
          price: 899.99,
          category: 'Phones',
          description: 'Samsung Galaxy S23 with 6.1" display, Snapdragon 8 Gen 2, 256GB storage, 50MP camera',
          image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=300',
          availability: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '9',
          name: 'Google Pixel 7',
          sku: 'PH-GOO-003',
          quantity: 14,
          price: 699.99,
          category: 'Phones',
          description: 'Google Pixel 7 with 6.3" display, Tensor G2 chip, 128GB storage, advanced AI camera',
          image: 'https://images.unsplash.com/photo-1592286115803-a1c3b552ee43?w=300',
          availability: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '10',
          name: 'OnePlus 11',
          sku: 'PH-ONE-004',
          quantity: 12,
          price: 799.99,
          category: 'Phones',
          description: 'OnePlus 11 with 6.7" AMOLED display, Snapdragon 8 Gen 2, 256GB storage, Hasselblad camera',
          image: 'https://images.unsplash.com/photo-1592286115803-a1c3b552ee43?w=300',
          availability: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '11',
          name: 'Xiaomi 13 Pro',
          sku: 'PH-XIA-005',
          quantity: 8,
          price: 699.99,
          category: 'Phones',
          description: 'Xiaomi 13 Pro with 6.73" AMOLED display, Snapdragon 8 Gen 2, 256GB storage, Leica camera',
          image: 'https://images.unsplash.com/photo-1592286115803-a1c3b552ee43?w=300',
          availability: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '12',
          name: 'OPPO Find X5 Pro',
          sku: 'PH-OPP-006',
          quantity: 6,
          price: 799.99,
          category: 'Phones',
          description: 'OPPO Find X5 Pro with 6.7" AMOLED display, Snapdragon 8 Gen 1, 256GB storage, MariSilicon X chip',
          image: 'https://images.unsplash.com/photo-1592286115803-a1c3b552ee43?w=300',
          availability: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '13',
          name: 'Vivo X90 Pro',
          sku: 'PH-VIV-007',
          quantity: 9,
          price: 699.99,
          category: 'Phones',
          description: 'Vivo X90 Pro with 6.78" AMOLED display, MediaTek Dimensity 9200, 256GB storage, Zeiss optics',
          image: 'https://images.unsplash.com/photo-1592286115803-a1c3b552ee43?w=300',
          availability: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '14',
          name: 'Realme GT 2 Pro',
          sku: 'PH-REA-008',
          quantity: 15,
          price: 599.99,
          category: 'Phones',
          description: 'Realme GT 2 Pro with 6.7" AMOLED display, Snapdragon 8 Gen 1, 256GB storage, paper-like design',
          image: 'https://images.unsplash.com/photo-1592286115803-a1c3b552ee43?w=300',
          availability: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '15',
          name: 'Nothing Phone (2)',
          sku: 'PH-NOT-009',
          quantity: 7,
          price: 599.99,
          category: 'Phones',
          description: 'Nothing Phone (2) with 6.7" LTPO display, Snapdragon 8+ Gen 1, 256GB storage, transparent design',
          image: 'https://images.unsplash.com/photo-1592286115803-a1c3b552ee43?w=300',
          availability: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '16',
          name: 'Motorola Edge 40 Pro',
          sku: 'PH-MOT-010',
          quantity: 11,
          price: 699.99,
          category: 'Phones',
          description: 'Motorola Edge 40 Pro with 6.67" OLED display, Snapdragon 8 Gen 2, 512GB storage, 125W fast charging',
          image: 'https://images.unsplash.com/photo-1592286115803-a1c3b552ee43?w=300',
          availability: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '17',
          name: 'Sony Xperia 1 V',
          sku: 'PH-SON-011',
          quantity: 5,
          price: 1299.99,
          category: 'Phones',
          description: 'Sony Xperia 1 V with 6.5" 4K OLED display, Snapdragon 8 Gen 2, 256GB storage, professional camera',
          image: 'https://images.unsplash.com/photo-1592286115803-a1c3b552ee43?w=300',
          availability: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        // Speakers
        {
          id: '18',
          name: 'JBL Flip 6',
          sku: 'SP-JBL-001',
          quantity: 30,
          price: 99.99,
          category: 'Speakers',
          description: 'Portable Bluetooth speaker with IP67 waterproof rating, 12-hour battery life, powerful bass',
          image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300',
          availability: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '24',
          name: 'Bose SoundLink Flex',
          sku: 'SP-BOSE-002',
          quantity: 22,
          price: 129.99,
          category: 'Speakers',
          description: 'Portable Bluetooth speaker with IP67 waterproof rating, 12-hour battery life, PositionIQ',
          image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300',
          availability: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '25',
          name: 'Sony SRS-XB43',
          sku: 'SP-SON-003',
          quantity: 18,
          price: 149.99,
          category: 'Speakers',
          description: 'Extra Bass portable Bluetooth speaker with IP67 waterproof rating, 24-hour battery life, Party Booster',
          image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300',
          availability: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '26',
          name: 'UE Wonderboom 3',
          sku: 'SP-UE-004',
          quantity: 25,
          price: 99.99,
          category: 'Speakers',
          description: 'Ultra-portable Bluetooth speaker with IP67 waterproof rating, 14-hour battery life, 360° sound',
          image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300',
          availability: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '27',
          name: 'Anker Soundcore Motion+',
          sku: 'SP-ANK-005',
          quantity: 28,
          price: 79.99,
          category: 'Speakers',
          description: 'Hi-Res Audio certified Bluetooth speaker with IPX7 waterproof rating, 12-hour battery life, aptX support',
          image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300',
          availability: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '28',
          name: 'Marshall Emberton',
          sku: 'SP-MAR-006',
          quantity: 15,
          price: 169.99,
          category: 'Speakers',
          description: 'Portable Bluetooth speaker with IPX7 waterproof rating, 20-hour battery life, Marshall signature sound',
          image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300',
          availability: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '29',
          name: 'JBL Charge 5',
          sku: 'SP-JBL-007',
          quantity: 20,
          price: 149.99,
          category: 'Speakers',
          description: 'Portable Bluetooth speaker with IP67 waterproof rating, 20-hour battery life, PartyBoost',
          image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300',
          availability: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '30',
          name: 'Bose SoundLink Revolve+',
          sku: 'SP-BOSE-008',
          quantity: 12,
          price: 219.99,
          category: 'Speakers',
          description: '360° sound Bluetooth speaker with IPX4 water resistance, 17-hour battery life, voice prompts',
          image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300',
          availability: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '31',
          name: 'Sony SRS-XG300',
          sku: 'SP-SON-009',
          quantity: 8,
          price: 199.99,
          category: 'Speakers',
          description: 'X-Series portable Bluetooth speaker with IP67 waterproof rating, 25-hour battery life, Mega Bass',
          image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300',
          availability: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '32',
          name: 'JBL Xtreme 3',
          sku: 'SP-JBL-010',
          quantity: 6,
          price: 379.99,
          category: 'Speakers',
          description: 'Powerful portable Bluetooth speaker with IP67 waterproof rating, 15-hour battery life, PartyBoost',
          image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300',
          availability: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '33',
          name: 'Bose Portable Smart Speaker',
          sku: 'SP-BOSE-011',
          quantity: 4,
          price: 299.99,
          category: 'Speakers',
          description: 'Smart Bluetooth speaker with Alexa built-in, IPX4 water resistance, 12-hour battery life, 360° sound',
          image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300',
          availability: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      setItems(sampleItems);
      localStorage.setItem('inventoryItems', JSON.stringify(sampleItems));
    }
    setLoading(false);
  }, []);

  const addItem = (itemData) => {
    const newItem = {
      ...itemData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setItems(prev => [...prev, newItem]);
    localStorage.setItem('inventoryItems', JSON.stringify([...items, newItem]));
    
    return { success: true, item: newItem };
  };

  const updateItem = (id, itemData) => {
    const updatedItems = items.map(item => 
      item.id === id 
        ? { ...item, ...itemData, updatedAt: new Date().toISOString() }
        : item
    );
    setItems(updatedItems);
    localStorage.setItem('inventoryItems', JSON.stringify(updatedItems));
    
    return { success: true, item: updatedItems.find(item => item.id === id) };
  };

  const deleteItem = (id) => {
    const updatedItems = items.filter(item => item.id !== id);
    setItems(updatedItems);
    localStorage.setItem('inventoryItems', JSON.stringify(updatedItems));
    
    return { success: true };
  };

  const getItem = (id) => {
    return items.find(item => item.id === id);
  };

  const searchItems = (query) => {
    if (!query) return items;
    
    const lowercaseQuery = query.toLowerCase();
    return items.filter(item => 
      item.name.toLowerCase().includes(lowercaseQuery) ||
      item.sku.toLowerCase().includes(lowercaseQuery) ||
      item.category.toLowerCase().includes(lowercaseQuery) ||
      item.description.toLowerCase().includes(lowercaseQuery)
    );
  };

  const filterByCategory = (category) => {
    if (!category || category === 'all') return items;
    return items.filter(item => item.category === category);
  };

  const getStats = () => {
    const totalItems = items.length;
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const lowStock = items.filter(item => item.quantity > 0 && item.quantity <= 5).length;
    const outOfStock = items.filter(item => item.quantity === 0).length;
    
    return {
      totalItems,
      totalQuantity,
      totalValue,
      lowStock,
      outOfStock,
      availableItems: items.filter(item => item.quantity > 0).length,
    };
  };

  const getCategories = () => {
    return [...new Set(items.map(item => item.category))];
  };

  const getCategoryStats = () => {
    const categories = ['Laptops', 'Phones', 'Speakers'];
    return categories.map(category => {
      const categoryItems = items.filter(item => item.category === category);
      return {
        category,
        totalQuantity: categoryItems.reduce((sum, item) => sum + item.quantity, 0),
        totalValue: categoryItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        itemCount: categoryItems.length,
      };
    });
  };

  return (
    <InventoryContext.Provider value={{ items, addItem, updateItem, deleteItem, getItem, searchItems, filterByCategory, getStats, getCategories, getCategoryStats, loading }}>
      {children}
    </InventoryContext.Provider>
  );
};

export default InventoryProvider;
