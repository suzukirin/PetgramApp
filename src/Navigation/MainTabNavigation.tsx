import React from 'react';
import { HomeScreen, SigninScreen, SignupScreen, PostImageScreen, ProfileScreen, } from "../Screens/Screens";
import { BottomTabBar, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from '@react-navigation/stack';
import firebase from "firebase";
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import ProfileStackNavigation from './ProfileStackNavigation'
const Tab = createBottomTabNavigator<MainTabParamList>();

type MainTabRouteProps = RouteProp<RootStackParamList, "Main">;
type Props = {
    route: MainTabRouteProps;
    navigation: StackNavigationProp<RootStackParamList, 'Main'>;
}

export default function MainTabNaigator(props: Props) {
    const navigation = props.navigation;
    const currentUser = props.route.params.user;

    const back = () => {
        navigation.goBack();
    };
    //サインアウトの処理
    const pressedSignOut = () => {
        firebase
            .auth()
            .signOut()
            .then(() => {
                console.log("サインアウトしました");
            })
            .catch((error) => {
                console.log(error);
            });
    };

    //ナビゲーションヘッダーの左側に配置
    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <View>
                    <TouchableOpacity
                        onPress={() => {
                            pressedSignOut();
                            back();
                        }}
                    >
                        <Text style={styles.spacer}>ログアウト</Text>
                    </TouchableOpacity>

                </View>
            ),
        });
    }, [navigation]);
    return (
        <Tab.Navigator>
            <Tab.Screen name="Home" component={HomeScreen} initialParams={{user : currentUser}}/>
            <Tab.Screen name="PostImage" component={PostImageScreen} initialParams={{ user: currentUser }}/>
            <Tab.Screen name="ProfileStack" component={ProfileStackNavigation} initialParams={{ user: currentUser }} />
            {/* <Tab.Screen name="Profileedit" component={ProfileScreen} initialParams={{ user: currentUser }} /> */}
        </Tab.Navigator>
    );

}
const styles = StyleSheet.create({
    addButton: {
        // position: 'absolute',
        // backgroundColor: 'white',
        width: 70,
        height: 70,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row'

    },
    addButtonIcon: {
        color: 'black',
        right: 50,
        bottom: 38,
        marginLeft: 10,

    },
    spacer: {
        fontSize: 18,
        // flexDirection: 'row'

    },
});
