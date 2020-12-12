interface PictureInfo {
    title: string;
    uri: string;
    createdAt: number;
}
type signedInUser = {
    email: string;
    uid: string;
};
type RootStackParamList = {
    //パラメータ :型
    Main: { user: signedInUser };
    SignIn: undefined;
    SignUp: undefined;
};

type ProfileRootStackParamList = {
    Profile: { user: signedInUser };
    Profileedit: { user: signedInUser }
};

type MainTabParamList = {
    Home: {user: signedInUser};
    PostImage: {user: signedInUser};
    ProfileStack: { user: signedInUser };
    Post: undefined;
    Profileedit: undefined;
};

type Article = {
    PhotoURI: string;
    title: string;
    text: string;
    createdAt: firebase.firestore.Timestamp;
    userId: string;
    file: string;
};

type UserInfo = {
    avatar: string;
    // emailaddress: string; //メアド編集機能つける時
    name: string;    
    userId: string;
    text: string;
    createdAt: firebase.firestore.Timestamp;
    file: string;
};

type ArticleContainer = {
    PhotoURI: string;
    title: string;
    text: string;
    createdAt: firebase.firestore.Timestamp;
    userId: string;
    file: string;
    avatar: string;
    name: string; 
};


type Message = {
    text: string;
    createdAt: firebase.firestore.Timestamp;
    userId: string;
};
declare module "*.png";
// interface SelectedImageInfo { //型を定義
//     localUri: string;
// }

// type pictureURl ={
//     pictureURl:string;
// }