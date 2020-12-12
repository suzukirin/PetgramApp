import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MainTabNavigation from "./src/Navigation/MainTabNavigation";
import "react-native-gesture-handler";
//Screens.tsでまとめたものをimport
import { HomeScreen, SigninScreen, SignupScreen, PostImageScreen, ProfileScreen, ProfileeditScreen } from "./src/Screens/Screens";
import "./src/Fire";
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
const Stack = createStackNavigator<RootStackParamList>();
// const BottomTab = createBottomTabNavigator<RootBottomParamList>();
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="SignIn">
        <Stack.Screen
          name="Main"
          component={MainTabNavigation}
          options={{ headerShown: true}}
        />
        <Stack.Screen
          name="SignIn"
          component={SigninScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SignUp"
          component={SignupScreen}
          options={{ headerShown: false }}/>
        
        
        </Stack.Navigator>
    </NavigationContainer>
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
