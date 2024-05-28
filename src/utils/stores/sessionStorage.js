/*
* @Author: Gace-DucHung
* @Date:   2016-11-21 23:15:38
* @Last Modified by:   Gace-DucHung
* @Last Modified time: 2016-11-21 23:17:07
*/

export const loadSessionStore = (key) => {
	try {
		const storeState = sessionStorage.getItem(key)
		if (storeState === null) {
			return undefined
		}
		return JSON.parse(storeState)
	}
	catch (e){
		return undefined
	}
}

export const saveSessionStore = (key,state) => {
	try{
		const storeState = JSON.stringify(state)
		sessionStorage.setItem(key, storeState)
	}
	catch (e){

	}
}

export const removeSessionStore = (key) => {
	sessionStorage.removeItem(key);
}