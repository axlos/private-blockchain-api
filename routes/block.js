const express = require('express');
const router = express.Router();
const blockchain = require('../models/blockchain');
const block = require('../models/block');
const {body, validationResult} = require('express-validator/check');

/* GET get block. */
router.get('/:blockId', function (req, res) {
	const blockId = req.params.blockId;
	const chain = new blockchain.Blockchain();
	chain.getBlock(blockId).then(block =>
		res.status(200).json(block)
	).catch(err =>
		res.status(404).json(err)
	);
});

/* POST new block to the chain. */
router.post('/', [
	body('data').exists().withMessage('Data must be exists')
		.not().isEmpty().trim().withMessage('Data must be not empty')
], function (req, res) {
	// Finds the validation errors in this request and wraps them in an object with handy functions
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({errors: errors.array()});
	}

	const chain = new blockchain.Blockchain();
	// Is there Genesis block?
	chain.getBlockHeight().then(count => {
		if (count < 0) {
			chain.addBlock(new block.Block("First block in the chain - Genesis block"))
				.then(() => addBlock(res, chain, req.body.data))
				.catch(err => res.status(500).json(err));
		} else {
			addBlock(res, chain, req.body.data);
		}
	});

});

addBlock = function (res, chain, data) {
	chain.addBlock(new block.Block(data)).then(hash => {
		chain.findByHash(hash).then(block =>
			res.status(200).json(block)
		).catch(err =>
			res.status(500).json(err)
		);
	}).catch(err => res.status(500).json(err));
};

module.exports = router;
