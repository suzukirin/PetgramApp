import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
    StyleSheet,
    Text,
    View,
    Button,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    Alert,
    StatusBar,
} from 'react-native';
import { useNavigation } from "@react-navigation/native";
import firebase from "firebase";
import { updateIdentifier } from "typescript";
// import {fireConfig} from "../Fire";

export function SigninScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigation = useNavigation();
    const toHome = (user: signedInUser) => {
        navigation.navigate("Home", { user: user });
    };
    const toSignup = () => {
        navigation.navigate("SignUp");
    };

    const pressedSignIn = (email: string, password: string) => {
        firebase
            .auth()
            .signInWithEmailAndPassword(email, password)
            .then((user) => {
                // userがnullかもしれない対策(firebaseモジュールの仕様？)   thenで書いたらそのあとはcatch書いてあげないとだめ
                if (!user) throw new Error("user is empty");             //trueだったらエラーで返してあげる | userがfalseなので、！で反転させてる
                if (!user.user) throw new Error("user.user is empty");     //ユーザーネームがないよ
                if (!user.user.email) throw new Error("user.user.email is empty");  //メアドがないよ

                Alert.alert("サインイン成功！", "正常にサインインできました。");
                //console.log(JSON.stringify(user));

                const currentUser: signedInUser = {
                    email: user.user.email,
                    uid: user.user.uid,
                };

                toHome(currentUser);
            })

            .catch((error) => {
                console.log(error);
                Alert.alert("エラー！", `${error}`);
            });
    };
    // Submitが押されたときにSign Up(登録処理)する関数
    // const pressedSubmit = (email: string, password: string) => {
    // ここでFirebaseでの登録
    // .の書き方はJavaScriptのプロミスという構文
    // awaitみたいな書き方
    // firebase
    // .auth()
    // .createUserWithEmailAndPassword(email, password)    //これ()の中自体が関数になる | メールとパスでユーザーを作ります
    // .then((user) => {
    // 登録成功したらログイン画面(thenの画面が呼ばれる)に戻る
    // Alert.alert("登録成功！", "サインインできるようになりました");
    // back();
    // })
    // .catch((error) => {
    // エラーが返ってきたらその内容をアラートで表示
    // console.log(error);
    // Alert.alert("エラー", `${error}`);  //テンプレートリテラル 変数 JavaScript
    // });

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView style={styles.container}>
                <View style={styles.titleAndFieldView}>
                    <Text style={styles.screenTitle}>Sign In!</Text>
                    <TextInput style={styles.inputField}
                        placeholder="メールアドレスを入力"
                        onChangeText={(email) => {  //ここの値は何でもいい 取ってきた値を渡す
                            setEmail(email);
                        }}
                        keyboardType="email-address"
                        //1文字目大文字にならないようにする
                        autoCapitalize="none" />
                    <TextInput style={styles.inputField}
                        placeholder=" パスワードを入力"
                        onChangeText={(password) => {
                            setPassword(password);
                        }}
                        keyboardType="visible-password"
                        //打ってる時パスワードを隠す機能
                        secureTextEntry={true} />
                    <ExpoStatusBar style="auto" />
                </View>

                {/* 
                onPressに関数を設定。
                Submitボタンの方に登録処理して前の画面に戻る関数、
                Backボタンには前の画面に戻るだけの関数 */}
                <View style={styles.includeButtons}>
                    <Button
                        title="Sign In"
                        onPress={() => {
                            pressedSignIn(email, password);
                        }}
                    />
                    <View style={styles.spacer}></View>
                    <Button title="SignUp"
                        onPress={() => {
                            toSignup();         //これだけでサインアップの画面に行ける
                        }}
                    />
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    },
    titleAndFieldView: {
        width: "90%",
        alignItems: "center",
        justifyContent: "center",
        flex: 3,
    },
    screenTitle: {
        fontSize: 30,
        marginBottom: 50,
    },
    inputField: {
        width: "80%",
        marginBottom: 20,
        height: 35,
        backgroundColor: "lightgray",
    },
    includeButtons: {
        flex: 4,
        marginVertical: 10,
    },

    spacer: {
        height: 30,
    },
});


//tryは例外があったときは上にもどす
//catchで受けとる