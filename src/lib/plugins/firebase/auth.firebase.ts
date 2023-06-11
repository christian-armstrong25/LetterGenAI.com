import { user } from "$stores/user";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth } from "./firebase";

const provider = new GoogleAuthProvider();

export const googleSignin = async () => {
	signInWithPopup(auth, provider)
		.then((result) => {
			const authUser = result.user;
			user.set(authUser);
		})
		.catch((error) => {
			console.error(error);
		});
};

export const logout = () => {
	signOut(auth);
};
