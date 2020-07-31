const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');

const redisUrl = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisUrl);
client.hget = util.promisify(client.hget);

// stores a reference to the original exec function

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function (options = {}) {
	this.useCache = true;
	this.hashKey = JSON.stringify(options.key || 'default');

	return this; //for chaining
};

mongoose.Query.prototype.exec = async function () {
	//'this' refers to the Query

	if (!this.useCache) {
		return exec.apply(this, arguments);
	}

	const key = JSON.stringify(
		Object.assign({}, this.getQuery(), {
			collection: this.mongooseCollection.name,
		})
	);

	// See if we have a value for 'key' in redis
	const cacheValue = await client.hget(this.hashKey, key);

	// If we do, return that

	if (cacheValue) {
		const doc = JSON.parse(cacheValue);
		//hydrate
		return Array.isArray(doc)
			? doc.map((d) => new this.model(d))
			: new this.model(doc);
	}

	// Otherwise, issue the query and store
	// the result in redis

	const result = await exec.apply(this, arguments);

	client.hset(this.hashKey, key, JSON.stringify(result));
	// client.set(key, JSON.stringify(result), 'EX', 10); 10초간 유효함 -이 방법 나중에 쓸수도
	//  하지만 이 방법은 자동으로 업데이트가 아닌, 유저가 올리고, 다시 로드 했을때 나오는 단점
	return result;
};

module.exports = {
	clearHash(hashKey) {
		client.del(JSON.stringify(hashKey));
	},
};
