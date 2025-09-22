import { Linking, StyleSheet, Text, View } from 'react-native';

const OutOfStockComponent = ({ itemName }) => {
  const whatsappNumber = '96181820902'; // Replace with your WhatsApp number (no +)
  const message = `I want to preorder this item ${itemName}`;
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  const handlePress = async () => {
    const supported = await Linking.canOpenURL(whatsappLink);
    if (supported) {
      await Linking.openURL(whatsappLink);
    } else {
      alert('WhatsApp is not installed or the link cannot be opened.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.outOfStockText}>Out of Stock</Text>
      {/* <TouchableOpacity style={styles.button} onPress={handlePress}>
        <Text style={styles.buttonText}>PREORDER</Text>
      </TouchableOpacity> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    alignItems: 'center',
  },
  outOfStockText: {
    color: '#222',
    fontSize: 24,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#1e90ff',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
});

export default OutOfStockComponent;
