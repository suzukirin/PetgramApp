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
    Home: { user: signedInUser };
    SignIn: undefined;
    SignUp: undefined;
    PostImage: undefined;
    Post: undefined;
};
type Message = {
    text: string;
    createdAt: firebase.firestore.Timestamp;
    userId: string;
};

