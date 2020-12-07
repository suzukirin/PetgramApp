import { StatusBar } from 'expo-status-bar';
import React ,{ useState} from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from "@react-navigation/native";


export function SignupScreen() {
    const navigation = useNavigation();
    const back = () => {
        navigation.goBack();
    };
    return (
        <View style={styles.container}>
            <Text>Open up App.tsx to start working on your app!</Text>
            <StatusBar style="auto" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
