import { user } from "$stores/user";
import {
	GoogleAuthProvider,
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signInWithPopup,
	signOut,
} from "firebase/auth";
import { auth } from "./firebase";

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

export const googleSignin = async () => {
	try {
		const result = await signInWithPopup(auth, googleProvider);
		const authUser = result.user;
		user.set(authUser);
	} catch (error) {
		console.error("Error in googleSignin:", error);
		throw error;
	}
};

// Email/Password Signin
export const emailSignin = async (email: string, password: string) => {
	try {
		const result = await signInWithEmailAndPassword(auth, email, password);
		const authUser = result.user;
		user.set(authUser);
	} catch (error) {
		console.error("Error in emailSignin:", error);
		throw error;
	}
};

// Email/Password Signup
export const emailSignup = async (email: string, password: string) => {
	try {
		const result = await createUserWithEmailAndPassword(auth, email, password);
		const authUser = result.user;
		user.set(authUser);
	} catch (error) {
		console.error("Error in emailSignup:", error);
		throw error;
	}
};

export const logout = () => {
	signOut(auth);
};
