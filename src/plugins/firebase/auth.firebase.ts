import { user } from "../lib/stores/user";
import {
	GoogleAuthProvider,
	createUserWithEmailAndPassword,
	deleteUser,
	sendPasswordResetEmail,
	signInWithEmailAndPassword,
	signInWithPopup,
	signOut,
	updateProfile,
	type User,
} from "firebase/auth";
import { auth } from "./firebase";

const googleProvider = new GoogleAuthProvider();

export const googleSignin = async () => {
	try {
		const result = await signInWithPopup(auth, googleProvider);
		user.set(result.user);
	} catch (error) {
		console.error("Error in googleSignin:", error);
		throw error;
	}
};

export const emailSignin = async (email: string, password: string) => {
	try {
		const result = await signInWithEmailAndPassword(auth, email, password);
		user.set(result.user);
	} catch (error) {
		console.error("Error in emailSignin:", error);
		throw error;
	}
};

export const emailSignup = async (
	email: string,
	password: string,
	firstName: string,
	lastName: string
) => {
	try {
		const result = await createUserWithEmailAndPassword(auth, email, password);
		await updateProfile(result.user, {
			displayName: `${firstName} ${lastName}`,
		});
		user.set(result.user);
	} catch (error) {
		console.error("Error in emailSignup:", error);
		throw error;
	}
};

export const logout = () => signOut(auth);

export const sendResetPasswordEmail = async (email: string) => {
	try {
		await sendPasswordResetEmail(auth, email);
	} catch (error) {
		console.error("Error in sendResetPasswordEmail:", error);
		throw error;
	}
};

export const getUserData = async (): Promise<User | null> => {
	return auth.currentUser;
};

export const deleteAccount = async () => {
	try {
		const currentUser = auth.currentUser;
		if (currentUser) {
			await deleteUser(currentUser);
		}
	} catch (error) {
		console.error("Error in deleteAccount:", error);
		throw error;
	}
};
