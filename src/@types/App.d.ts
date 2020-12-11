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
    Main: undefined;
    SignIn: undefined;
    SignUp: undefined;
    PostImage: undefined;
    Post: undefined;
    Profile: undefined,
    Profileedit: undefined,
};

type  Article = {
    PhotoURI:string;
    title:string;
    text: string;
    createdAt: firebase.firestore.Timestamp;
    userId: string;
    file:string;
};

type User = {
    avatar:string;
    emailaddress:string;
    name:string;
    userid:string;
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