import { StatusBar } from 'expo-status-bar';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RouteProp } from '@react-navigation/native';
import Icon from "react-native-vector-icons/FontAwesome";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import moment from 'moment';
import firebase from "firebase";
import * as MediaLibrary from 'expo-media-library';
import { savePictureInfoAsync } from './Store';
import React, { useState, useEffect } from 'react';
// import { List } from 'react-native-paper'
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
    Pressable
} from 'react-native';



type Props = {
    navigation: BottomTabNavigationProp<MainTabParamList, 'PostImage'>;
    route: RouteProp<MainTabParamList, 'PostImage'>;
};
const screenWidth = Dimensions.get('screen').width




export function PostImageScreen(props: Props) {
    const navigation = props.navigation;
    const currentUser = props.route.params.user;
    const [titleText, setTitleText] = useState('')
    const [pictureURI, setPictureURI] = useState('');
    const [selectedImage, setSelectedImage] = React.useState<SelectedImageInfo | undefined>();
    const [articles, setArticles] = useState<Article[]>([]);
    // const [text, setText] = useState<string>("");

    const getArticleDocRef = async () => {
        return await firebase.firestore().collection("article").doc();
    };

    //send押した時CloudFirestoreに保存しつつ画面に追加
    const sendArticle = async () => {

        // ${ user.uid }
        const storageRef = firebase.storage().ref('Photo');
        const remotePath = `${moment.now()}.jpg`;

        const ref = storageRef.child(remotePath);
        // const url = await ref.getDownloadURL();
        const response = await fetch(pictureURI);
        // const responses = await fetch(url); //←
        const blob = await response.blob()
        // const bloba = await responses.blob() //←
        const task = await ref.put(blob);

        const photoURI = await task.ref.getDownloadURL();

        const docRef = await getArticleDocRef();
        const newArticle = {
            PhotoURI: photoURI,
            title: titleText,
            text: "",
            createdAt: firebase.firestore.Timestamp.now(),
            userId: currentUser.uid,
            file: remotePath,
        } as Article;
        await docRef.set(newArticle);
        // キャッシュを削除
        FileSystem.deleteAsync(pictureURI);

        // Homeへ
        navigation.goBack();

        setPictureURI("");
    }




    // キャッシュ用の変数を追加
    const pictureURICache = React.useRef('');

    // カメラを起動して画像を取得する
    const takePictureFromCameraAsync = async () => {
        const result = await ImagePicker.launchCameraAsync({ aspect: [3, 4], allowsEditing: true });
        if (result.cancelled) return;
        setPictureURI(result.uri);

        // useRefにも保存する
        pictureURICache.current = result.uri;
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
        // 写真が設定されていないとアラート
        if (pictureURI === '') {
            alert('写真が有りません');
            return;
        }

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
        FileSystem.deleteAsync(pictureURI);

        // Homeへ
        navigation.goBack();
    }
    // const [selectedImage, setSelectedImage] = React.useState<SelectedImageInfo | undefined>();    
    // if (selectedImage !== (null || undefined)) {
    const Preview = () => {
        return (
            <View>
                <Image style={styles.preview} source={{ uri: pictureURI }} />
                {/* <Image source={{ uri: selectedImage?.localUri }}/> */}
                {/* <Image style={styles.preview} source={{ uri: selectedImage?.localUri }} /> */}
            </View>
        );
    }

    const Camera = () => {
        return (
            <TouchableOpacity
                style={styles.cameraButton}
                // カメラ起動のfunctionを追加
                onPress={() => takePictureFromCameraAsync()}
            >
                <Icon name="camera" size={30} />
            </TouchableOpacity>
        );
    }

    //カメラロール挑戦
    interface SelectedImageInfo { //型を定義
        localUri: string;
    }
    // undefinedは元々なくて、nullは空
    // const [selectedImage, setSelectedImage] = React.useState<SelectedImageInfo | undefined>();

    let openImagePickerAsync = async () => {
        let permissionResult = await ImagePicker.requestCameraRollPermissionsAsync();

        if (permissionResult.granted === false) {
            alert("カメラロールへのアクセス許可が必要です！");
            return;
        }

        let pickerResult = await ImagePicker.launchImageLibraryAsync(({ aspect: [3, 4], allowsEditing: true }));
        // console.log(pickerResult);
        if (pickerResult.cancelled === true) {
            return;
        }
        setPictureURI(pickerResult.uri);
        // const selectedUri = {};
        // console.log(pickerResult);
        // setSelectedImage({ localUri: pickerResult.uri });
    };
    return (
        <KeyboardAwareScrollView style={{backgroundColor: '#fff'}}>
            <View style={styles.container}>
                <View style = {styles.buttoncontainer}>
                <Pressable
                    onPress={openImagePickerAsync}>
                    <Icon
                        // style={styles.Photobutton}
                        name="photo"
                        size={30} />
                </Pressable>
                    <Camera />
                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={sendArticle}
                    >
                        <Icon name="check" size={30} />
                    </TouchableOpacity>
                
                </View>
                <View style={styles.previewContainer}>
                    <Preview />
                    {/* {selectedImage?.localUri ? <Preview /> : <Camera />} */}

                </View>
                <KeyboardAvoidingView
                    style={styles.titleInputConatiner}
                    behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
                >
                    <TextInput
                        style={styles.titleInput}
                        placeholder="  キャプションを入力  "
                        multiline
                        onChangeText={value => setTitleText(value)}
                        maxLength={40}
                    />
                </KeyboardAvoidingView>

                {/* <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.buttonText}>キャンセル</Text> */}
                {/* </TouchableOpacity> */}
                {/* <Button
                    title="Back"
                    onPress={() => navigation.goBack()}
                /> */}
            </View>
        </KeyboardAwareScrollView >
    );
}





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
        // flexDirection: "row",
        alignItems: 'center',
        padding:100,
    },
    titleInput: {
        //flex: 0.9,
        color: "#000",
        fontSize: 20,
        borderWidth: 1,
        backgroundColor: '#f0f8ff',
        width: "800%",
        height: "50%",
        padding:50,

        
        // borderRadius: 10,
        //marginTop: 20,
        //marginBottom: 20,
        //    padding: 60,

    },
    cameraButton: {
        // width: screenWidth * 0.8,
        // height: screenWidth * 0.5 * 4 / 3,
        // borderRadius: 30,
        // borderWidth: 1,
        // justifyContent: 'center',
        // alignItems: 'center',
        paddingBottom: 80,
    },
    previewContainer: {
        flex: 7,
        justifyContent: 'center',
        alignItems: 'center',

    },
    preview: {
        width: screenWidth * 0.8,
        height: screenWidth * 0.8 * 4 / 3,
    },
    buttonContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        width: '100%',

    },
    saveButton: {
        // backgroundColor: '#77f',
        // padding: 5,
        // borderRadius: 10,
        // width: 120,
        alignItems: 'center',
        // left: 80,
    },
    cancelButton: {
        backgroundColor: '#f77',
        padding: 5,
        borderRadius: 10,
        width: 120,
        alignItems: 'center',
    },
    buttonText: {
        flexDirection: 'row',
        fontSize: 20,
    },
    button: {
        // padding: 20,
        borderRadius: 5,
    },
    Photobutton: {
        // flexDirection: 'row',
        // left: 80,
        // padding: 60,
        // alignItems: 'center',
    },
    buttoncontainer : {
        flexDirection: 'row',
        marginTop:20,
    }
});
