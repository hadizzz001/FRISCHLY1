import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const PromoBanner = () => {
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const res = await fetch('https://diablocar.netlify.app/api/banner2'); // Update to your actual endpoint
        const data = await res.json();
        setBanner(data[0]);
      } catch (error) {
        console.error('Error fetching banner:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBanner();
  }, []);

  const handleShopNow = () => {
    Linking.openURL('https://your-website.com/shop'); // Adjust your link
  };

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <Text style={styles.bannerText}>
              {banner?.name || 'No Offer'}
            </Text>
            <Text style={styles.bannerOffer}>
              {banner?.off ? `- ${banner.off}` : ''}
            </Text>
          </>
        )}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleShopNow}>
        <Text style={styles.buttonText}>Shop <Text style={{ fontWeight: 'bold' }}>Now</Text></Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    padding: 16,
    marginVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  bannerText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'System', // You can customize if you're using custom fonts
  },
  bannerOffer: {
    color: '#f43f5e', // Tailwind red-500
    fontSize: 16,
    fontFamily: 'System',
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  buttonText: {
    color: '#000',
    fontWeight: '600',
  },
});

export default PromoBanner;
