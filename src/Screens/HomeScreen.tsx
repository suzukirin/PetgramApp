import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { useNavigation, RouteProp } from "@react-navigation/native";
// import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { loadPictureInfoListAsync, removePictureInfoAsync } from './Store';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as ImagePicker from 'expo-image-picker';
import moment from "moment";
// import { HomeItem } from "../HomeItem";
import firebase from "firebase";
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
} from 'react-native';



        //スクリーンの端末の画面の幅をとる
        const screenWidth = Dimensions.get('screen').width
        //ナビゲーション系？
        type HomeScreenRouteProps = RouteProp<RootStackParamList, "Home">;
        type Props = {
            route: HomeScreenRouteProps;
            // navigation: StackNavigationProp<RootStackParamList, 'Home'>;
        };
        
        
    export  function HomeScreen(props: Props) {
                const currentUser = props.route.params.user;

                const navigation = useNavigation();
                const back = () => {
                    navigation.goBack();
                };
            
                const [text, setText] = useState<string>("");
                const [messages, setMessages] = useState<Message[]>([]);
            
                //DBから読み込む
                const getMessageDocRef = async () => {
                    return await firebase.firestore().collection("messages").doc();
                };
            
                //send押した時CloudFirestoreに保存しつつ画面に追加
                const sendMessage = async (value: string, user: signedInUser) => {
                    if (value != "") {
                        const docRef = await getMessageDocRef();
                        const newMessage = {
                            text: value,
                            createdAt: firebase.firestore.Timestamp.now(),
                            userId: user.uid,
                        } as Message;
                        await docRef.set(newMessage);
                        setText("");
                    } else {
                        Alert.alert("エラー", "メッセージを入力してください！");
                    }
                };

                //CloudFirestoreからメッセージをとってくる(常時監視)
                const getMessages = async () => {
                    const messages = [] as Message[];
                    await firebase
                        .firestore()
                        .collection("messages")
                        .orderBy("createdAt")
                        .onSnapshot((snapshot) => {
                            snapshot.docChanges().forEach((change) => {
                                //変化の種類が"added"だったときの処理
                                if (change.type === "added") {
                                    //今アプリにもっているmessagesに取得した差分を追加
                                    messages.unshift(change.doc.data() as Message);
                                    // } else if (change.type === "removed") {
                                    //   console.log("【modified data】");
                                    // } else if (change.type === "modified") {
                                    //   console.log("【deleted some data】");
                                }
                                setMessages(messages);
                            });
                        });
                };
            
                //差分が出ても更新しないようにする
                const unsubscribe = () => {
                    firebase
                        .firestore()
                        .collection("messages")
                        .orderBy("createdAt")
                        .onSnapshot((snapshot) => {
                        });
                };

                //サインアウトの処理
                const pressedSignOut = () => {
                    firebase
                        .auth()
                        .signOut()
                        .then(() => {
                            unsubscribe();
                            console.log("サインアウトしました");
                        })
                        .catch((error) => {
                            console.log(error);
                        });
                };
            
                //ナビゲーションヘッダーの左側に配置
                React.useLayoutEffect(() => {
                    navigation.setOptions({
                        headerLeft: () => (
                            <TouchableOpacity
                                onPress={() => {
                                    pressedSignOut();
                                    back();
                                }}
                            >
                                <Text>Sign Out</Text>
                            </TouchableOpacity>
                        ),
                    });
                }, [navigation]);
            
                useEffect(() => {
                    getMessages();
                }, []);
                
                    const [hasPermission, setHasPermission] = useState(false);
                    const [pictureInfoList, setPictureInfoList] = useState<PictureInfo[]>([]);
    
                    // アプリの初期化
                    const initAppAsync = async () => {
                    //カメラのアクセス権限を取得
                    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
                    const cameraRollPermission = await ImagePicker.requestCameraRollPermissionsAsync();
                    const granted = cameraPermission.granted && cameraRollPermission.granted;
                        setHasPermission(granted);
                }
    
                // 画像リストをストレージから読み込み、更新する
                    const updatePictureInfoListAsync = async () => {
                    const newPictureInfoList = await loadPictureInfoListAsync();
                    setPictureInfoList(newPictureInfoList.reverse());   //データを取得したタイミングで順番を逆順にします。 配列の順序を逆にするのでreverseメソッドを使います。
                }
                
                // 初期化処理      空を入れることで無駄な処理がなくなる
                React.useEffect(() => { initAppAsync(); }, []);
                // 画面遷移時の処理
                useFocusEffect(
                    React.useCallback(() => {
                        updatePictureInfoListAsync();
                    }, [])
                );
                
                // 画像情報の削除処理 + 画面更新
                const removePictureInfoAndUpdateAsync = async (pictureInfo: PictureInfo) => {
                    await removePictureInfoAsync(pictureInfo);
                    updatePictureInfoListAsync();
                }
                
                // +ボタンの処理
                const handleAddButton = () => {
                    navigation.navigate('PostImage');
                }
                
                // 写真を長押ししたときの処理
                const handleLongPressPicture = (item: PictureInfo) => {
                    Alert.alert(
                        item.title,
                        'この写真のタイトル編集または削除ができます。',
                        [
                            {
                                text: 'キャンセル',
                                style: 'cancel',
                            },
                            {
                                text: '削除',
                                onPress: () => { removePictureInfoAndUpdateAsync(item); }
                            }
                        ]
                    );
                }
                
                const UnPermission = () => {
                    return <Text>カメラ及びカメラロールへのアクセス許可が有りません。</Text>
                }
                
                // FlatList内で表示する部分
                const renderPictureInfo = ({ item }: ListRenderItemInfo<PictureInfo>) => {
                    return (
                        <TouchableOpacity onLongPress={() => handleLongPressPicture(item)}>
                            <View style={styles.pictureInfoContainer}>
                                <Text style={styles.pictureTitle}>{item.title}</Text>
                                <Image style={styles.picture} source={{ uri: item.uri }} />
                                <Text style={styles.timestamp}>撮影日時: {moment(item.createdAt).format('YYYY/MM/DD HH:mm:ss')}</Text>
                            </View>
                        </TouchableOpacity>
                    )
                }
                
                // FlatList部分
                const PictureDiaryList = () => {                    
                    return (
                        <View style={{ flex: 1 }}>
                            {/* <FlatList */}
                                 {/* data={pictureInfoList} */}
                                 {/* renderItem={renderPictureInfo} */}
                                 {/* keyExtractor={(item) => `${item.createdAt}`} */}
                            {/* /> */}
                            {/* <TouchableOpacity */}
                                {/* style={styles.addButton}
                                onPress={handleAddButton}
                             >  */}
                                {/* <Icon style={styles.addButtonIcon} name="plus" size={50} /> */}
                            {/* </TouchableOpacity> */}
                        </View>
                        )            
                    };
                    return (
                        <SafeAreaView >
                        <Text> ログイン中</Text>
                            <FlatList
                                data={pictureInfoList}
                                renderItem={renderPictureInfo}
                                keyExtractor={(item) => `${item.createdAt}`}
                            />
                            <TouchableOpacity
                                style={styles.addButton}
                                onPress={handleAddButton}
                            >
                                <Icon style={styles.addButtonIcon} name="plus" size={50} />
                            </TouchableOpacity>
                        </SafeAreaView>
        );
                    }
    
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    pictureInfoContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: 'black',
        borderWidth: 2,
        borderRadius: 10,
        padding: 5,
        margin: 5,
    },
    picture: {
        // 横の幅に合わせて3:4
        width: screenWidth * 0.8,
        height: screenWidth * 0.8 * 4 / 3,
    },
    pictureTitle: {
        fontSize: 30,
    },
    timestamp: {
        fontSize: 15,
    },
    addButton: {
        position: 'absolute',
        right: 15,
        backgroundColor: '#77f',
        width: 70,
        height: 70,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addButtonIcon: {
        color: '#fff',
    }
});
    