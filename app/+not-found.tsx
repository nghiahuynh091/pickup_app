import { View, StyleSheet } from "react-native";
import { Link, Stack } from "expo-router";

export default function NotFoundScreen(){
    return (
        <>
        <Stack.Screen options={{title: 'Damn! Not Found'}}/>
        <View style={styles.container}>
            <Link href=".." style={styles.button}>
            Go back now my friend</Link>
        </View>
        </>
    );
}
const styles = StyleSheet.create({
    container:{
        flex:1,
        backgroundColor: '#2528',
        justifyContent: 'center',
        alignItems: 'center',
    },
    button: {
        fontSize: 20,
        textDecorationLine: 'underline',
        color: '#fff',
    },
});