// src/data/staticBrands.ts

interface BrandsData {
    [key: string]: string[];
}

const staticBrands: BrandsData = {
    A: ['Adidas', 'Apple', 'Amazon', 'Audi', 'Adobe'],
    B: ['BMW', 'Bose', 'Burberry', 'Barbie', 'ByteDance'],
    C: ['Chanel', 'Coca-Cola', 'Canon', 'Casio', 'Chevrolet'],
    D: ['Dior', 'Disney', 'Dell', 'Domino\'s', 'Duracell'],
    E: ['Ebay', 'Ericsson', 'Estée Lauder', 'Evernote', 'Express'],
    F: ['Facebook', 'Ferrari', 'Ford', 'Fossil', 'Fila'],
    G: ['Google', 'Gucci', 'Gap', 'Gillette', 'General Motors'],
    H: ['Hermès', 'HP', 'Honda', 'Hyundai', 'Harley-Davidson'],
    I: ['IBM', 'IKEA', 'Intel', 'Instagram', 'Indeed'],
    J: ['Jaguar', 'Jeep', 'Jordan (Nike)', 'JBL', 'J.Crew'],
    K: ['Kia', 'KFC', 'Kleenex', 'Kodak', 'Kellogg\'s'],
    L: ['Lacoste', 'Lego', 'Levi\'s', 'Louis Vuitton', 'L\'Oréal'],
    M: ['Microsoft', 'Mercedes-Benz', 'McDonald\'s', 'Mastercard', 'Meta'],
    N: ['Nike', 'Nintendo', 'Netflix', 'Nokia', 'Nestlé'],
    O: ['Oakley', 'Oracle', 'Oreo', 'Opel', 'Old Navy'],
    P: ['Prada', 'Pepsi', 'Puma', 'Panasonic', 'Philips'],
    Q: ['Qualcomm', 'Qantas', 'Quiksilver'],
    R: ['Rolex', 'Ray-Ban', 'Red Bull', 'Reebok', 'Rolls-Royce'],
    S: ['Samsung', 'Sony', 'Starbucks', 'Spotify', 'Subway'],
    T: ['Toyota', 'Tesla', 'Tiffany & Co.', 'Target', 'T-Mobile'],
    U: ['Under Armour', 'Uniqlo', 'Uber', 'Unilever'],
    V: ['Versace', 'Vodafone', 'Volkswagen', 'Visa', 'Volvo'],
    W: ['Walmart', 'Walt Disney', 'WhatsApp', 'Wells Fargo'],
    X: ['Xerox', 'Xiaomi', 'Xfinity'],
    Y: ['Yahoo', 'Yamaha', 'YouTube', 'Yelp'],
    Z: ['Zara', 'Zoom', 'Zappos', 'Zenith', 'Zidane', 'Zaria', 'Zahoo', 'Zibra', 'Zout', 'Zamin']
};

export default staticBrands;