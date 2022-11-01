let activeReactiveFn = null; //保存用于get 时候获取对应fn 加入依赖

/**
 * //1.优化存储数据
 * //2.depend 方法优化   addDepend ===》 depend
 */
class Depend {
	constructor() {
		this.reactiveFns = new Set(); //1.优化存储数据
	}

	// addDepend(reactiveFn) {
	// 	this.reactiveFns.push(reactiveFn);
	// }
	depend() {
		if (activeReactiveFn) {
			this.reactiveFns.add(activeReactiveFn); //push改为add
		}
	}

	notify() {
		this.reactiveFns.forEach((fn) => {
			fn();
		});
	}
}

//每个属性对应一个类   new Depended() => reactiveFns []
//响应式函数

function watchFn(fn) {
	activeReactiveFn = fn;
	fn();
	activeReactiveFn = null;
}

//封装获取 depend 函数
const targetMap = new WeakMap();
function getDepend(target, key) {
	//根据target 获取对应目标的map 数据管理对象
	let map = targetMap.get(target);
	if (!map) {
		map = new Map();
		targetMap.set(target, map);
	}

	//根据key 获取depend 对象
	let depend = map.get(key);
	if (!depend) {
		depend = new Depend();
		map.set(key, depend);
	}
	return depend;
}

//数据
const obj = {
	name: "kobe",
	age: 18,
};
const info = {
	address: "china",
};

/**
 * 监听对象属性变量:Proxy(vue3) Object.defineProperty (vue2)
 *
 */

const objProxy = new Proxy(obj, {
	get: function (target, key, receiver) {
		//根据对应target，key 获取对应depend
		// console.log(target);

		const depend = getDepend(target, key);
		depend.depend();

		return Reflect.get(target, key, receiver);
	},
	set: function (target, key, newValue, receiver) {
		Reflect.set(target, key, newValue, receiver);
		//depend.notify(); //监听数据变化，自动通知
		const depend = getDepend(target, key);
		depend.notify();
	},
});

/**
 * 需要监听的回调函数
 */
watchFn(() => {
	console.log(objProxy.name, "---------");
	console.log(objProxy.name, "+++++++++");
});

/**
 * 修改数据
 */

objProxy.name = "james";
// objProxy.name = "js";
// objProxy.name = "cc";
