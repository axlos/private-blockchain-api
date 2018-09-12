/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');
/**
 * Configure simpleChain.js with levelDB to persist blockchain dataset using the level Node.js library.
 */
const level = require('level');
const chainDB = './chaindata';
const db = level(chainDB);
const block = require('./block');

class Blockchain {
	constructor() {
		// Is there Genesis block?
		this.getBlockHeight().then(count => {
			if (count < 0) {
				this.addBlock(new block.Block("First block in the chain - Genesis block"));
			}
		});
	}

	// Add new block
	addBlock(newBlock) {
		return new Promise((resolve, reject) => {
			this.getBlockHeight().then(count => {
				// Block height
				newBlock.height = count + 1;
				// UTC timestamp
				newBlock.time = new Date().getTime().toString().slice(0, -3);
				if (count >= 0) {
					this.getBlock(count).then(block => {
						// previous block hash
						newBlock.previousBlockHash = block.hash;
						// Block hash with SHA256 using newBlock and converting to a string
						newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
						// Adding block object to chain
						db.put(newBlock.height, JSON.stringify(newBlock), (err) => {
							if (err) {
								reject(err);
							} else {
								resolve(newBlock.hash);
							}
						})
					})
				} else {
					// Block hash with SHA256 using newBlock and converting to a string
					newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
					// Adding block object to chain
					db.put(newBlock.height, JSON.stringify(newBlock), (err) => {
						if (err) {
							reject(err);
						} else {
							resolve(newBlock.hash)
						}
					})
				}
			})
		})
	}

	// Get block height
	getBlockHeight() {
		return new Promise(resolve => {
			let count = 0;
			db.createReadStream({
				keys: true,
				values: false
			})
				.on('data', (data) => {
					count++;
				})
				.on('end', () => {
					resolve(count - 1)
				})
		});
	}

	findByHash(hash) {
		return new Promise((resolve, reject) => {
			let found = false;
			db.createValueStream()
				.on('data', (data) => {
					let block = JSON.parse(data);
					if (block.hash === hash) {
						found = true;
						resolve(block);
					}
				})
				.on('end', () => {
					if (!found) {
						reject('Not found');
					}
				});
		});
	}

	// get block
	getBlock(blockHeight) {
		return new Promise((resolve, reject) => {
			// return object as a single string
			db.get(blockHeight, (err, value) => {
				if (err) {
					reject('Not found');
				} else {
					resolve(JSON.parse(value))
				}
			})
		})
	}

	// validate block
	validateBlock(blockHeight) {
		return new Promise((resolve, reject) => {
			// get block object
			this.getBlock(blockHeight).then(block => {
				// get block hash
				let blockHash = block.hash;
				console.log('Validing block: ', blockHash);
				// remove block hash to test block integrity
				block.hash = '';
				// generate block hash
				let validBlockHash = SHA256(JSON.stringify(block)).toString();
				// Compare
				if (blockHash === validBlockHash) {
					resolve({
						valid: true,
						height: blockHeight
					});
				} else {
					console.log('Block #' + blockHeight + ' invalid hash:\n' + blockHash + '<>' + validBlockHash);
					resolve({
						valid: false,
						height: blockHeight
					});
				}
			}).catch(err => {
				reject({
					valid: false,
					height: blockHeight
				});
			})
		});
	}

	// Validate blockchain
	validateChain() {
		let p = new Promise((resolve, reject) => {
			let errorLog = [];
			let valided = [];
			this.getBlockHeight().then(chainHeight => {
				for (let i = 0; i < chainHeight + 1; i++) {
					this.validateBlock(i).then(result => {
						// validate block
						if (!result.valid) {
							errorLog.push(result.height);
						}
						// compare blocks hash link
						if (result.height < chainHeight) {
							let currentBlock = this.getBlock(result.height);
							let previousBlock = this.getBlock(result.height + 1);
							Promise.all([currentBlock, previousBlock]).then(blocks => {
								let blockHash = blocks[0].hash;
								let previousHash = blocks[1].previousBlockHash;
								if (blockHash !== previousHash) {
									errorLog.push(result.height);
								}
								valided.push(result.height);
								// Check when we have valided all blocks
								if (valided.length >= chainHeight) {
									resolve(errorLog);
								}
							})
						}
					});
				}
			});
		});

		p.then(errorLog => {
			if (errorLog.length > 0) {
				console.log('Block errors = ' + errorLog.length);
				console.log('Blocks: ' + errorLog);
			} else {
				console.log('No errors detected');
			}
		});
	}

	iterateChain(remove) {
		return new Promise((resolve, reject) => {
			db.createReadStream()
				.on('data', (data) => {
					if (remove) {
						db.del(data.key);
					} else {
						console.log(data.key, '=', data.value);
					}
				})
				.on('error', function () {
					reject();
				})
				.on('end', function () {
					resolve();
				})
		});
	}

}

module.exports = {
	Blockchain: Blockchain,
};