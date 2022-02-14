const ainUtil = require('@ainblockchain/ain-util');

const getTransactionHash = (transaction) => {
	return '0x' + ainUtil.hashTransaction(transaction).toString('hex');
}

const getAddress = (hash, signature) => {
	const sigBuffer = ainUtil.toBuffer(signature);
	const len = sigBuffer.length;
	const lenHash = len - 65;
	const { r, s, v } = ainUtil.ecSplitSig(sigBuffer.slice(lenHash, len));
	const publicKey = ainUtil.ecRecoverPub(Buffer.from(hash.slice(2), 'hex'), r, s, v);
	return ainUtil.toChecksumAddress(ainUtil.bufferToHex(
		ainUtil.pubToAddress(publicKey, publicKey.length === 65)));
}

const verifySignature = (tx, sig, addr) => {
	return ainUtil.ecVerifySig(tx, sig, addr);
}

module.exports = {
	getTransactionHash,
	getAddress,
	verifySignature
}
