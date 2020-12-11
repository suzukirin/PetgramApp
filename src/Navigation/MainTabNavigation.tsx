import React from 'react';
import { HomeScreen, SigninScreen, SignupScreen, PostImageScreen, ProfileScreen ,} from "../Screens/Screens";
import { BottomTabBar, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation, RouteProp } from "@react-navigation/native";
import firebase from "firebase";
import { TouchableOpacity, View ,Text ,StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
const Tab = createBottomTabNavigator();
// type HomeScreenRouteProps = RouteProp<RootStackParamList, "Home">;
// type Props = {
// route: HomeScreenRouteProps;
// navigation: StackNavigationProp<RootStackParamList, 'Home'>;
// }
export default function MainTabNaigator() {
    const navigation = useNavigation();
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
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="PostImage" component={PostImageScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
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
        padding: 30,
        marginTop: 30,
        paddingBottom: 3,
        // flexDirection: 'row'

    },
});
