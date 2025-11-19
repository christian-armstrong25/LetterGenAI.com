import { database } from "$plugins/firebase/firebase";
import { onValue, ref, set } from "firebase/database";

export function loadUserData(userID: string, callback: (data: any) => void) {
	onValue(
		ref(database, `/users/${userID}`),
		(snapshot) => {
			const userData = snapshot.val();
			if (userData) callback(userData);
		},
		{ onlyOnce: true }
	);
}

export function saveUserData(userID: string, data: any) {
	set(ref(database, `users/${userID}`), data);
}
