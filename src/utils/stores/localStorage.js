/*
* @Author: Gace-DucHung
* @Date:   2016-10-29 13:39:03
* @Last Modified by:   Gace-DucHung
* @Last Modified time: 2016-11-03 02:26:38
*/

export const loadStore = (key) => {
	try {
		const storeState = localStorage.getItem(key)
		if (storeState === null) {
			return undefined
		}
		return JSON.parse(storeState)
	}
	catch (e){
		return undefined
	}
}

export const saveStore = (key,state) => {
	try{
		const storeState = JSON.stringify(state)
		localStorage.setItem(key, storeState)
	}
	catch (e){

	}
}

export const removeStore = (key) => {
	localStorage.removeItem(key);
}