import { StatusBar } from "expo-status-bar";
import { useNavigation, useFocusEffect, useIsFocused } from "@react-navigation/native";
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from "react-native-vector-icons/FontAwesome";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import moment from 'moment';
import firebase from "firebase";
import logo from '../assets/images/user.png';
import * as MediaLibrary from 'expo-media-library';
import { savePictureInfoAsync } from './Store';
// import { Thumbnail } from "native-base";
import React, { useState } from 'react';
import {
    Button,
    StyleSheet,
    Text,
    View,
    Image,
    KeyboardAvoidingView,
    Platform,
    TextInput,
    TouchableOpacity,
    Dimensions,
    Pressable,
    ListRenderItemInfo,
} from 'react-native';
import { FlatList } from "react-native-gesture-handler";


type Props = {
    navigation: StackNavigationProp<ProfileRootStackParamList>;
    route: RouteProp<ProfileRootStackParamList, 'Profile'>;
};
// const screenWidth = Dimensions.get('screen').width


export function ProfileeditScreen(props: Props) {
    const navigation = props.navigation;
    const currentUser = props.route.params.user;
    const [titleText, setTitleText] = useState('')
    const [pictureURI, setPictureURI] = useState('');
    const [userInfo, setUserinfo] = useState<UserInfo[]>([]);
    const [articleList, setArticleList] = useState<Article[]>([]);
    // キャッシュ用の変数を追加
    const pictureURICache = React.useRef('');
    const isFocused = useIsFocused();

    const getUserInfoDocRef = async () => {
        return await firebase.firestore().collection("User").doc();
    };
    //send押した時CloudFirestoreに保存しつつ画面に追加
    const sendUserInfo = async () => {
        // ${ user.uid }
        // 画像のアップロード
        const storageRef = firebase.storage().ref('Avatar');
        const remotePath = `${moment.now()}.jpg`;

        const ref = storageRef.child(remotePath);
        // const url = await ref.getDownloadURL();
        const response = await fetch(pictureURI);
        // const responses = await fetch(url); //←
        const blob = await response.blob()
        // const bloba = await responses.blob() //←
        const task = await ref.put(blob);
        const avatar = await task.ref.getDownloadURL();

        // getUserInfoDocRef();
        //  ユーザーidをドキュメントのidとする
        const docRef = await firebase.firestore().collection('User').doc(currentUser.uid);
        const doc = await docRef.get();
        // const snapshot =await query.get();

        if (doc.exists === false) {
            // 検索結果が空なら新規作成
            const newUserInfo = {
                avatar: avatar,
                // emailaddress: string;
                userId: currentUser.uid,
                name: titleText,
                text: "",
                createdAt: firebase.firestore.Timestamp.now(),
                file: remotePath,
            } as UserInfo;
            await docRef.set(newUserInfo);
        } else {
            // すでにデータが有ったら上書き
            const userInfo = doc.data() as UserInfo;
            //古いアイコンを削除
            storageRef.child(userInfo.file).delete();
            docRef.update({ 'avatar': avatar, 'name': titleText, 'file': remotePath });
        }
        // キャッシュを削除
        FileSystem.deleteAsync(pictureURI);
        // Homeへ
        props.navigation.goBack();
        setPictureURI("");

        // キャッシュを削除
        FileSystem.deleteAsync(pictureURICache.current);
        //         const docRef = firebase.firestore().collection("User");
        //         docRef.set();
        // }



        // Homeへ
        navigation.goBack();

        setPictureURI("");
    };



    React.useEffect(() => {
        return (() => {
            // キャッシュを削除
            if (pictureURICache.current !== '') {      //空ではなかったらこの処理をします
                FileSystem.deleteAsync(pictureURICache.current, { idempotent: true }); //idempotent:その操作を何回繰り返しても，１回だけ実行した時と同じ結果になること。
            }
        });
    }, [])


    // 保存ボタンの処理
    const saveAsync = async () => {
        // // タイトルが設定されていないとアラート
        // if (titleText === '') {
        //     alert('タイトルを入力してください');
        //     return;
        // }
        // // 写真が設定されていないとアラート
        // if (pictureURI === '') {
        //     alert('写真が有りません');
        //     return;
        // }

        // カメラロールへ画像を保存
        const asset = await MediaLibrary.createAssetAsync(pictureURI);

        // ストレージの画像リストに追加
        const newPictureInfo: PictureInfo = {
            title: titleText,
            uri: asset.uri,
            createdAt: moment.now(),
        };
        await savePictureInfoAsync(newPictureInfo);

        // キャッシュを削除
        FileSystem.deleteAsync(pictureURICache.current);

        // Homeへ
        //navigation.goBack();
    }

    const Preview = () => {
        return (
            <Image style={styles.preview} source={{ uri: pictureURI }} />
        );
    }
    interface SelectedImageInfo { //型を定義
        localUri: string;
    }
    // undefinedは元々なくて、nullは空

    const Camera = () => {
        return (
            <TouchableOpacity
                style={styles.cameraButton}
                onPress={openImagePickerAsync}
            >
                <Image source={logo} style={styles.logo} />
            </TouchableOpacity>
        );
    };


    let openImagePickerAsync = async () => {
        let permissionResult = await ImagePicker.requestCameraRollPermissionsAsync();

        if (permissionResult.granted === false) {
            alert("カメラロールへのアクセス許可が必要です！");
            return;
        }
        let pickerResult = await ImagePicker.launchImageLibraryAsync({ aspect: [1, 1], allowsEditing: true });

        if (pickerResult.cancelled === true) {
            return;
        } else {
            setPictureURI(pickerResult.uri);
        }
    };

    const getArticleListAsync = async () => {
        const query = firebase
            .firestore()
            .collection("article")
            .where("userId", "==", currentUser.uid);

        const snapshot = await query.get();
        const newArticleList = snapshot.docs.map((item) => {
            return item.data() as Article;
        });
        setArticleList(newArticleList);
    }

    useFocusEffect(
        React.useCallback(() => {
            if (isFocused) {
                getArticleListAsync();
            }
        }, [])
    );
    const renderArticle = ({ item }: ListRenderItemInfo<Article>) => {
        return (

            <TouchableOpacity >
                {/* onLongPress={() => handleLongPressPicture(item)}> */}
                <View >
                    {/* style={styles.pictureInfoContainer}> */}
                    <Image style={styles.picture} source={{ uri: item.PhotoURI }} />
                    <Text >
                        {/* style={styles.pictureTitle}> */}
                        {item.title}</Text>
                    {/* <Text style={styles.timestamp}>撮影日時: {moment(item.createdAt).format('YYYY/MM/DD HH:mm:ss')}</Text> */}
                </View>
            </TouchableOpacity>
        )
    }
    const handleAddButton = () => {
        navigation.navigate('Profileedit', { user: currentUser });
    }
    return (
        <KeyboardAwareScrollView style={{ backgroundColor: '#fff',}}>
            <View style={styles.container}>
                <KeyboardAvoidingView
                    style={styles.titleInputConatiner}
                    behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
                >
                    {/* <TouchableOpacity
                        onPress={handleAddButton}
                    >
                        <Icon
                            name="plus-square-o"
                            size={50}
                        />
                    </TouchableOpacity> */}
            <View style={styles.profileContainer}>
                <View style={styles.previewContainer}>
                    {pictureURI ? <Preview /> : <Camera />}
                </View>
                    <TextInput
                        style={styles.titleInput}
                        placeholder="Name"
                        onChangeText={value => setTitleText(value)}
                        maxLength={20}
                    />
                </View>
                </KeyboardAvoidingView>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={sendUserInfo}
                    >
                        <Icon name="check" size={30} />
                    </TouchableOpacity>
                    {/* <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => {/*navigation.goBack()*/ }
                    {/* > */}
                        {/* <Text style={styles.buttonText}>キャンセル</Text> */}
                    {/* </TouchableOpacity>  */}
                </View>
                {/* <FlatList
                    data={articleList}
                    renderItem={renderArticle}
                    keyExtractor={(item) => `${item.createdAt}`}
                /> */}
            </View>
        </KeyboardAwareScrollView >
    );
}


const screenWidth = Dimensions.get("screen").width;
const screenHeight = Dimensions.get("screen").height;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    // ココから追加
    titleInputConatiner: {
        flex: 1,
        flexDirection: "row",
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    titleInput: {
        // flex: 0.9,
        color: "#000",
        fontSize: 20,
        borderWidth: 2,
        borderRadius: 10,
        backgroundColor: '#fff',
        marginTop:50,
        padding: 3,
        width:140,
        height:40,
        right:40,
    },
    cameraButton: {
        width: 120,
        height: 120,
        borderRadius: 80,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        right: 120,
    },
    previewContainer: {
        // flex: 7,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        left:50,
        marginTop:20,
    },
    preview: {
        // width: screenWidth * 0.8,
        // height: screenWidth * 0.8 * 4 / 3,
        width: screenHeight / 5,
        height: screenHeight / 5,
        borderRadius: screenHeight / 10,
        marginBottom: 15,
        borderColor: "black",
        borderWidth: 2,
    },
    buttonContainer: {
        flex: 1,
        // flexDirection: 'row',
        justifyContent: 'space-around',
        // alignItems: 'center',
        // width: '100%',
    },
    saveButton: {
        padding: 5,
        width: 120,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#f77',
        padding: 5,
        borderRadius: 10,
        width: 120,
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 20,
    },
    logo: {
        width: 80,
        height: 80,
    },
    picture: {
        width: screenWidth * 0.3,
        height: screenWidth * 0.3
    },
    profileContainer : {
        flexDirection: 'row',
    }
});
