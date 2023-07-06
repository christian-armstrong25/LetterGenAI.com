$stores/user";
import {
	GoogleAuthProvider,
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signInWithPopup,
	signOut,
	sendPasswordResetEmail,
    deleteUser,
    updateProfile
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
export const emailSignup = async (email: string, password: string, firstName: string, lastName: string) => {
	try {
		const result = await createUserWithEmailAndPassword(auth, email, password);
		const authUser = result.user;
        await updateProfile(authUser, {
            displayName: firstName + " " + lastName,
        });
		user.set(authUser);
	} catch (error) {
		console.error("Error in emailSignup:", error);
		throw error;
	}
};


export const logout = () => {
	signOut(auth);
};

export async function sendResetPasswordEmail(email) {
    try {
        await sendPasswordResetEmail(auth, email);
    } catch (error) {
        throw error;
    }
}

export const getUserData = async () => {
	try {
		const user = auth.currentUser;
		return user;
	} catch (error) {
		console.error("Error in getUserData:", error);
		throw error;
	}
};

export const deleteAccount = async () => {
	try {
		const user = auth.currentUser;
		await deleteUser(user);
	} catch (error) {
		console.error("Error in deleteAccount:", error);
		throw error;
	}
};

export const upgradePlan = async () => {
	try {
		// upgrade plan logic goes here
	} catch (error) {
		console.error("Error in upgradePlan:", error);
		throw error;
	}
};