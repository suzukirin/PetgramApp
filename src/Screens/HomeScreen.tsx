import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { useNavigation, RouteProp } from "@react-navigation/native";
// import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { loadPictureInfoListAsync, removePictureInfoAsync } from './Store';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as ImagePicker from 'expo-image-picker';
import moment from "moment";
import { PostImageScreen, ProfileScreen } from "./Screens";
import firebase from "firebase";
import heart from '../assets/images/heart.jpg';
import com from '../assets/images/comment.png';
import {
    StyleSheet,
    Text,
    View,
    SafeAreaView,
    TextInput,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    FlatList,
    Platform,
    StatusBar,
    Button,
    Dimensions,
    Image,
    ListRenderItemInfo,
    Pressable,
} from 'react-native';
import { userInfo } from 'os';
import { isWhiteSpaceLike } from 'typescript';



//スクリーンの端末の画面の幅をとる
const screenWidth = Dimensions.get('screen').width
//ナビゲーション系？
type HomeScreenRouteProps = RouteProp<RootStackParamList, "Main">;
type Props = {
    route: HomeScreenRouteProps;
    // navigation: StackNavigationProp<RootStackParamList, 'Home'>;
};



export function HomeScreen(props: Props) {
    // export function HomeScreen() {
    const [hasPermission, setHasPermission] = useState(false);
    const [ArticleList, setArticleList] = useState<ArticleContainer[]>([]);

    const currentUser = props.route.params.user;
    const navigation = useNavigation();

    const back = () => {
        navigation.goBack();
    };

    const [text, setText] = useState<string>("");
    const [messages, setMessages] = useState<Message[]>([]);


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
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={handleAddButton}
                    >
                        <Icon
                            style={styles.addButtonIcon}
                            name="plus-square-o"
                            size={50}
                        />
                    </TouchableOpacity>

                </View>
            ),
        });
    }, [navigation]);
    useEffect(() => {
        //この中をまるまる変更(関数getMessagesの中身をここに記述)
        const articles: ArticleContainer[] = [];
        /* const unsubscribe = の部分を追加 */
        const unsubscribe = firebase
            .firestore()
            .collection("article")
            .orderBy("createdAt", "desc")
            .onSnapshot((snapshot) => {
                snapshot.docChanges().forEach(async (change) => {
                    //変化の種類が"added"だったときの処理
                    if (change.type === "added") {
                        //今アプリにもっているarticleに取得した差分を追加
                        const article: Article = change.doc.data() as Article

                        const query = firebase
                            .firestore()
                            .collection("User")
                            .where("userId", "==", article.userId);

                        const snapshot = await query.get();
                        const user = snapshot.docs[0].data() as UserInfo;


                        const newArticleContainer: ArticleContainer = {
                            PhotoURI: article.PhotoURI,
                            title: article.title,
                            text: article.text,
                            createdAt: article.createdAt,
                            userId: article.userId,
                            file: article.file,
                            avatar: user.avatar,
                            name: user.name,
                        }
                        articles.unshift(newArticleContainer);

                    }
                    setArticleList(articles.slice());
                });

            });
        /* この部分を追加 */
        return unsubscribe; //リスナーのデタッチ
    }, []);

    // アプリの初期化
    const initAppAsync = async () => {
        //カメラのアクセス権限を取得
        const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
        const cameraRollPermission = await ImagePicker.requestCameraRollPermissionsAsync();
        const granted = cameraPermission.granted && cameraRollPermission.granted;
        setHasPermission(granted);
    }

    // 初期化処理      空を入れることで無駄な処理がなくなる
    React.useEffect(() => { initAppAsync(); }, []);
    // 画面遷移時の処理
    // useFocusEffect(
    //     React.useCallback(() => {
    //         updatePictureInfoListAsync();
    //     }, [])
    // );

    // 画像情報の削除処理 + 画面更新
    const removeArticleAsync = async (article: ArticleContainer) => {
        // alert('test');
        try {
            // Create a reference to the file to delete
            const storageRef = firebase.storage().ref('Photo');
            const deleteRef = storageRef.child(article.file);

            // Delete the file
            deleteRef.delete();
        } catch (error) {
            alert('Delete Storage ' + error.toString());
        }

        try {
            const query = firebase
                .firestore()
                .collection("article")
                .where("createdAt", "==", article.createdAt);

            const docs = await query.get();
            docs.forEach(result => {
                result.ref.delete();
            });
        } catch (error) {
            alert('Delete Firestore ' + error.toString());
        }


    }

    const removeArticleAndUpdateAsync = async (article: ArticleContainer) => {
        await removeArticleAsync(article);

    }

    // +ボタンの処理
    const handleAddButton = () => {
        navigation.navigate('PostImage');
    }

    // 写真を長押ししたときの処理
    const handleLongPressPicture = (item: ArticleContainer) => {
        if (currentUser.uid === item.userId) {
            Alert.alert(
                item.title,
                '削除しますか？',
                [
                    {
                        text: 'キャンセル',
                        style: 'cancel',
                    },
                    {
                        text: '削除',
                        onPress: () => { removeArticleAndUpdateAsync(item); }
                    }
                ]
            );

        }


    }

    const UnPermission = () => {
        return <Text>カメラ及びカメラロールへのアクセス許可が有りません。</Text>
    }

    // FlatList内で表示する部分
    const renderPictureInfo = ({ item }: ListRenderItemInfo<ArticleContainer>) => {
        return (

            <TouchableOpacity onLongPress={() => handleLongPressPicture(item)}>
                <View style={styles.userContainer}>
                    <Image 
                            source={{ uri: item.avatar }}
                            style ={styles.avatar}
                    />
                    <Text style={styles.username} > {item.name} </Text>
                </View>
                <View style={styles.pictureInfoContainer}>
                    <Image style={styles.picture} source={{ uri: item.PhotoURI }} />
                    <View style = { styles.iconContainer}>
                    <Image source={heart} style={styles.heart} />
                    <Image source={com} style={styles.com} />
                    </View>
                    <Text style={styles.pictureTitle}>{item.title}</Text>
                    {/* <Text style={styles.timestamp}>撮影日時: {moment(item.createdAt).format('YYYY/MM/DD HH:mm:ss')}</Text> */}
                </View>
            </TouchableOpacity>
        )
    }

    // FlatList部分
    // const PictureDiaryList = () => {
    //     return (
    //         // <View style={{ flex: 1 }}>
    //             {/* <FlatList */}
    //             {/* data={pictureInfoList} */}
    //             {/* renderItem={renderPictureInfo} */}
    //             {/* keyExtractor={(item) => `${item.createdAt}`} */}
    //             {/* /> */}
    //             {/* <TouchableOpacity */}
    //             {/* style={styles.addButton}
    //                             onPress={handleAddButton}
    //                         >  */}
    //             {/* <Icon style={styles.addButtonIcon} name="plus" size={50} /> */}
    //             {/* </TouchableOpacity> */}
    //         </View>
    //     )
    // };

    return (
        <SafeAreaView style={{ backgroundColor: '#fff',}} >
            <Text style={styles.titlename}>Petgram<Icon name="github" size={45}  /></Text>
            <FlatList
                data={ArticleList}
                renderItem={renderPictureInfo}
                keyExtractor={(item) => `${item.createdAt}`}
            />

        </SafeAreaView>

    );

}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        // flexDirection: 'row',
    },
    pictureInfoContainer: {
        // flex: 1,
        // justifyContent: 'center',
        // alignItems: 'center',
        // borderColor: 'black',
        // borderWidth: 1,
        // width: screenWidth * 1,
        // height: screenWidth * 0.65 * 4 / 4,
        // borderRadius: 10,
        // padding: 10,
        // marginTop: 10,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: 'black',
        // borderTopWidth: 1,
        // borderBottomWidth: 1,
        borderRadius: 10,
        padding: 20,
        margin: 5,
        backgroundColor: '#fff',
    },
    picture: {
        // 横の幅に合わせて3:4
        // width: screenWidth * 0.8,
        // height: screenWidth * 0.3 * 4 / 3,
        width: screenWidth * 1,
        height: screenWidth * 0.8 * 4 / 3,
        // marginTop: 30,

    },
    pictureTitle: {
        fontSize: 30,
    },
    timestamp: {
        fontSize: 15,
    },
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
    username: {
        fontSize: 25,
        marginTop: 38,
        marginRight:10,
        

    },
    userContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
    },
    avatar:{
        width: 50,
        height: 50,
        borderRadius:50,
        marginLeft:10,
        marginTop: 30,
    },
    titlename :{
        fontSize:30,
        backgroundColor: '#fff',
        padding:15,
    },
    heart :{
        width:30,
        height:30,
        right:140,
        marginTop:10,
    },
    com :{
        width: 50,
        height: 50,
        right: 130,
        marginTop: 0,
    },
    iconContainer :{
        flexDirection: 'row',
    }
});
