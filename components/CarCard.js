import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

interface Size {
  size: string;
  qty: number;
  price: number;
}

interface Color {
  sizes?: Size[];
}

interface TempProps {
  _id: string;
  title: string;
  price: number;
  discount: number;
  img: string[];
  stock: string;
  type: 'single' | 'collection';
  color: Color[];
}

interface CarCardProps {
  temp: TempProps;
  index: number;
}

const CarCard: React.FC<CarCardProps> = ({ temp, index }) => {
  const navigation = useNavigation();
  const { _id, title, discount, img, stock, type, color } = temp;
    const router = useRouter(); 

  // Rotate 3 background colors
  const bgColors = ['#dc2626', '#2563eb', '#059669']; // red, blue, green
  const selectedBg = bgColors[index % bgColors.length];

  // Determine if product is out of stock
  const isOutOfStock =
    (type === 'single' && parseInt(stock) === 0) ||
    (type === 'collection' &&
      color?.every(c =>
        c.sizes?.every(size => parseInt(size.qty.toString()) === 0)
      ));

  // Calculate price range
  const getPriceDisplay = () => {
    if (type === 'single' || (type === 'collection' && !color)) {
      return `$${discount}`;
    }

    if (type === 'collection' && color && color.some(c => c.sizes?.length)) {
      const prices = color.flatMap(c => c.sizes || []).map(s => s.price);
      if (prices.length === 0) return 'N/A';
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      return minPrice === maxPrice
        ? `$${minPrice.toFixed(2)}`
        : `$${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`;
    }

    return `$${discount}`;
  };

  const getOriginalPrice = () => {
    if (type === 'single' || (type === 'collection' && !color)) {
      return `$${(discount * 1.25).toFixed(2)}`;
    }

    if (type === 'collection' && color && color.some(c => c.sizes?.length)) {
      const prices = color.flatMap(c => c.sizes || []).map(s => s.price * 1.25);
      if (prices.length === 0) return 'N/A';
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      return minPrice === maxPrice
        ? `$${minPrice.toFixed(2)}`
        : `$${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`;
    }

    return `$${(discount * 1.25).toFixed(2)}`;
  };

  const getSizesDisplay = () => {
    const sizes = Array.from(
      new Set(color.flatMap(c => c.sizes?.map(s => s.size) || []))
    );
    return sizes.length > 0 ? sizes.join(', ') : 'N/A';
  };

  const handlePress = () => {  
    router.push(`/product/${temp._id}`);
  };

  return (
    <TouchableOpacity style={styles.cardContainer} onPress={handlePress}>
      {/* Image Section */}
      <View style={styles.imageWrapper}>
        <Image
          source={{
            uri: img[0].replace(
              '/upload/',
              '/upload/c_pad,w_400,h_400,b_white,q_25/'
            ),
          }}
          style={styles.productImage}
          resizeMode="contain"
        />

        {/* Discount Badge */}
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>-25%</Text>
        </View>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}
      </View>

      {/* Title Section */}
      <View style={[styles.titleContainer, { backgroundColor: selectedBg }]}>
        <Text style={styles.titleText} numberOfLines={1}>
          {title}
        </Text>
      </View>

      {/* Sizes */}
      <Text style={styles.sizesText}>{getSizesDisplay()}</Text>

      {/* Price Section */}
      <View style={styles.priceContainer}>
        <Text style={styles.priceText}>{getPriceDisplay()}</Text>
        <Text style={styles.originalPriceText}>{getOriginalPrice()}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ccc',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
    height: 400,
    flexDirection: 'column',
  },
  imageWrapper: {
    height: 250,
    backgroundColor: '#fff',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#dc2626',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  discountText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(75, 85, 99, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  outOfStockText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  titleContainer: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  titleText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sizesText: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#fde68a',
    fontWeight: 'bold',
    fontSize: 16,
    color: '#000',
  },
  priceContainer: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fde68a',
  },
  priceText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#000',
  },
  originalPriceText: {
    fontSize: 14,
    textDecorationLine: 'line-through',
    color: '#9ca3af',
    marginTop: 4,
  },
});

export default CarCard;
