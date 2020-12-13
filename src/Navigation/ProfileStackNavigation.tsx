import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer, RouteProp } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { BottomTabNavigationProp, createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import "react-native-gesture-handler";
//Screens.tsでまとめたものをimport
import { ProfileScreen, ProfileeditScreen } from "../Screens/Screens";
// import { BottomTabBar } from 'react-navigation-tabs';
// import { createBottomTabNavigator } from 'react-navigation-tabs';
// import { Image } from "react-native-elements";
//import Home from "~/screens/Home";
// import Search from "~/screens/Search";
// import Like from "~/screens/Favorite";
// import Profile from "~/screens/Profile";
// import Add from "~/screens/Add";

// 
// const Tab = createBottomTabNavigator();
const Stack = createStackNavigator<ProfileRootStackParamList>();
// const BottomTab = createBottomTabNavigator<RootBottomParamList>();

type Props = {
    route: RouteProp<MainTabParamList, "ProfileStack">;
    navigation: BottomTabNavigationProp<MainTabParamList, "ProfileStack">;
}

export default function ProfileStackNaigation(props: Props) {
    const currentUser = props.route.params.user

    // export default function App() {
    return (

        <Stack.Navigator
            initialRouteName="Profile">
            <Stack.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ headerShown: false }}
                initialParams={{ user: currentUser }}
            />
            <Stack.Screen
                name="Profileedit"
                component={ProfileeditScreen}
                options={{ headerShown: false }}
                initialParams={{ user: currentUser }}
            />
        </Stack.Navigator>

    );
}


// const BottomTab = reateBottomTabNavigator<RootTabParamList>();
// export default (createBottomTabNavigator(
// {
// Home: {
// screen: Home,
// navigationOptions: {
// tabBarIcon: <Image style={{ width: 32, height: 32 }}
// source={require('~/assets/images/home.png')} />
// }
// },
// Search: {
// screen: Search,
// navigationOptions: {
// tabBarIcon: <Image style={{ width: 32, height: 32 }}
// source={require('~/assets/images/search.png')} />
// }
// },
// Add: {
// screen: Add,
// navigationOptions: {
// tabBarIcon: <Image style={{ width: 32, height: 32 }}
// source={require('~/assets/images/add.png')} />
// }
// },
// Like: {
// screen: Like,
// navigationOptions: {
// tabBarIcon: <Image style={{ width: 36, height: 36 }}
// source={require('~/assets/images/heart.jpg')} />
// }
// },
// Profile: {
// screen: Profile,
// navigationOptions: {
// tabBarIcon: <Image style={{ width: 32, height: 32 }}
// source={require('~/assets/images/user.png')} />
// }
// }
// },
// {
// tabBarOptions: {
// showLabel: false,
// tabStyle: {
// padding: 20
// },
// },
// initialRouteName: 'Home',
// 
// }
// ));




const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
