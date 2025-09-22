import { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import TextTicker from 'react-native-text-ticker';

const { width } = Dimensions.get('window');

const NewsTicker = () => {
  const [textItems, setTextItems] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('https://diablocar.netlify.app/api/banner1');
        const data = await res.json();
        if (Array.isArray(data[0]?.name)) {
          setTextItems(data[0].name);
        }
      } catch (error) {
        console.error('Error fetching banner data:', error);
      }
    };

    fetchData();
  }, []);

  const combinedText = textItems.join('           '); // Customize separator

  return (
    <View style={styles.container}>
      <TextTicker
        style={styles.tickerText}
        duration={15000}
        loop
        bounce={false}
        repeatSpacer={50}
        marqueeDelay={1000}
        scrollSpeed={50}
      >
        {combinedText}
      </TextTicker>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width - 40,
    height: 50,
    backgroundColor: 'black',
    borderRadius: 12,
    justifyContent: 'center',
    overflow: 'hidden',
    alignSelf: 'center',
  },
  tickerText: {
    fontSize: 18,
    color: 'white',
    paddingHorizontal: 10,
  },
});

export default NewsTicker;
