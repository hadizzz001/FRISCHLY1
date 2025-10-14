import { ScrollView, StyleSheet, Text } from 'react-native';

const TermsAndConditions = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Terms and Conditions</Text>

      <Text style={styles.paragraph}>
        Welcome to Frischly Shop. By using our app and services, you agree to these terms and conditions. Please read them carefully.
      </Text>

      <Text style={styles.subtitle}>1. Orders</Text>
      <Text style={styles.paragraph}>
        All orders are subject to product availability. We reserve the right to refuse or cancel any order for any reason.
      </Text>

      <Text style={styles.subtitle}>2. Payments</Text>
      <Text style={styles.paragraph}>
        We accept online payments through our secure payment system. By providing payment information, you authorize us to charge the total amount for your order. Make sure your payment information is accurate to avoid delays.
      </Text>

      <Text style={styles.subtitle}>3. Shipping & Delivery</Text>
      <Text style={styles.paragraph}>
        Delivery times are estimated and may vary. Frischly Shop is not responsible for delays caused by carriers or unforeseen circumstances.
      </Text>

      <Text style={styles.subtitle}>4. Returns & Refunds</Text>
      <Text style={styles.paragraph}>
        If you are not satisfied with your purchase, please contact us within 7 days of delivery. Refunds will be processed according to our return policy.
      </Text>

      <Text style={styles.subtitle}>5. User Responsibilities</Text>
      <Text style={styles.paragraph}>
        You agree to use our app for lawful purposes only and provide accurate information when creating an account or placing an order.
      </Text>

      <Text style={styles.subtitle}>6. Changes to Terms</Text>
      <Text style={styles.paragraph}>
        Frischly Shop may update these terms and conditions from time to time. Your continued use of the app constitutes acceptance of any changes.
      </Text>

      <Text style={styles.subtitle}>7. Contact Us</Text>
      <Text style={styles.paragraph}>
        For any questions regarding these terms and conditions, please contact us at info@frischlyshop.com.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 5,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 22,
    color: '#333',
  },
});

export default TermsAndConditions;
