import { Dimensions, Image, StyleSheet, View } from "react-native";
import Swiper from "react-native-swiper";

const { width } = Dimensions.get("window");

const images = [
	"https://res.cloudinary.com/dtzuor7no/image/upload/v1757967098/abundance-healthy-food-choices-supermarket-aisle-generated-by-ai_om2rqs.webp",
	"https://res.cloudinary.com/dtzuor7no/image/upload/v1757967098/abundance-healthy-food-choices-supermarket-aisle-generated-by-ai2_omuscm.webp",
	"https://res.cloudinary.com/dtzuor7no/image/upload/v1757967099/abundance-healthy-food-choices-supermarket-aisle-generated-by-ai1_tocg1i.webp",
];

const MyCarousel = () => {
	return (
		<View style={styles.container}>
			<Swiper
				showsPagination
				autoplay
				loop
				autoplayTimeout={5}
				dotStyle={styles.dot}
				activeDotStyle={styles.activeDot}
			>
				{images.map((img, index) => (
					<View key={index} style={styles.slide}>
						<Image
							source={{ uri: img }}
							style={styles.image}
							resizeMode="contain"
						/>
					</View>
				))}
			</Swiper>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		height: 250,
		backgroundColor: "#fff",
	},
	slide: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},
	image: {
		width: width - 20,
		height: 200,
		backgroundColor: "#000",
	},
	bannerTitle: {
		position: "absolute",
		bottom: 20,
		left: 20,
		color: "#fff",
		fontSize: 20,
		fontWeight: "bold",
		backgroundColor: "rgba(0,0,0,0.5)",
		paddingHorizontal: 10,
		paddingVertical: 5,
		borderRadius: 6,
	},
	dot: {
		backgroundColor: "rgba(255,255,255,0.3)",
		width: 8,
		height: 8,
		borderRadius: 4,
		margin: 3,
	},
	activeDot: {
		backgroundColor: "#fff",
		width: 10,
		height: 10,
		borderRadius: 5,
		margin: 3,
	},
});

export default MyCarousel;
