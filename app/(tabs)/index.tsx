import Button from "@/components/Button";
import ImageViewer from "@/components/ImageViewer";
import { StyleSheet, View } from "react-native";

const PlaceholderImage = require("@/assets/images/background-image.png");

export default function Index() {
  return (
    <View style={styles.container}>
      {/* <Text style={styles.text}>Home screen</Text>
      <Link href="/about" style={styles.button}>
        Got to the About screen
      </Link> */}
      <View style={styles.imageContainer}>
        <ImageViewer imgSource={PlaceholderImage}></ImageViewer>
      </View>
      <View style={styles.footContainer}>
        <Button theme='primary' label="Choose a picture" />
        <Button label="Use this picture" />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
    alignItems: 'center',
  },
  imageContainer: {
    flex: 1,
    paddingTop: 28,
  },
  footContainer: {
    flex: 1 / 3,
    alignItems: 'center',
  },
});
