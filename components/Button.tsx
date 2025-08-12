import { FontAwesome } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
type Props = {
  label: string;
  theme?: "primary";
};
export default function Button({ label, theme }: Props) {
  if (theme === "primary") {
    return (
      <View
        style={[
          styles.ButtonContainer,
          {
            borderColor: "#ffd33d",
            borderRadius: 18,
            borderWidth: 4,
          },
        ]}
      >
        <Pressable
          style={[styles.Button, { backgroundColor: "#fff" }]}
          onPress={() => alert("You have just fucking pressed a button")}
        >
          <FontAwesome
            name="picture-o"
            size={18}
            color="#25292e"
            style={styles.ButtonIcon}
          />

          <Text style={[styles.ButtonLabel, { color: "#25292e" }]}>{label}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.ButtonContainer}>
      <Pressable
        style={styles.Button}
        onPress={() => alert("You have just fucking pressed a button")}
      >
        <Text style={styles.ButtonLabel}>{label}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  ButtonContainer: {
    width: 280,
    height: 68,
    marginHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    padding: 3,
  },
  Button: {
    borderRadius: 10,
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  ButtonIcon: {
    paddingRight: 8,
  },
  ButtonLabel: {
    color: "#fff",
    fontSize: 16,
  },
});
