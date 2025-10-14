import { ScrollView, StyleSheet, Text } from 'react-native';

const PrivacyPolicy = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Privacy Policy</Text>

      <Text style={styles.paragraph}>
        Welcome to Frischly Shop. We respect your privacy and are committed to protecting your personal information.
      </Text>

      <Text style={styles.subtitle}>1. Information We Collect</Text>
      <Text style={styles.paragraph}>
        We may collect information such as your name, email address, phone number, and shipping address when you make a purchase or contact us.
      </Text>

      <Text style={styles.subtitle}>2. How We Use Your Information</Text>
      <Text style={styles.paragraph}>
        Your information is used to process orders, communicate with you, and improve our services.
      </Text>

      <Text style={styles.subtitle}>3. Sharing Information</Text>
      <Text style={styles.paragraph}>
        We do not sell or rent your personal information to third parties. We may share your information with trusted partners to deliver your orders.
      </Text>

      <Text style={styles.subtitle}>4. Security</Text>
      <Text style={styles.paragraph}>
        We take reasonable steps to protect your personal information from unauthorized access, use, or disclosure.
      </Text>

      <Text style={styles.subtitle}>5. Changes to This Policy</Text>
      <Text style={styles.paragraph}>
        We may update this privacy policy from time to time. Please review it periodically for any changes.
      </Text>

      <Text style={styles.subtitle}>6. Contact Us</Text>
      <Text style={styles.paragraph}>
        If you have any questions about this privacy policy, please contact us at info@frischlyshop.com.
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

export default PrivacyPolicy;
