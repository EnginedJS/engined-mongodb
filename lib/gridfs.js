try {
	const gridStream = require('gridfs-stream');
} catch(e) {
	const gridStream = null;
}

module.exports = class GridFS {

	constructor(agent, namespace) {
		this.agent = agent;
		this.namespace = namespace || '';
		this.fs = gridStream(agent.connection.db, mongoose.mongo);
	}

	parseOpts(opts) {
		let _opts = Object.assign({}, opts);

		if (_opts.filename) {
			_opts.filename = this.namespace + '_' + _opts.filename;
		}

		return _opts;
	}

	createReadStream(opts) {

		let _opts = this.parseOpts(opts);

		return this.fs.createReadStream(_opts);
	}

	createWriteStream(opts) {

		let _opts = this.parseOpts(opts);

		return this.fs.createWriteStream(_opts);
	}

	exists(opts) {

		let _opts = this.parseOpts(opts);

		return new Promise((resolve, reject) => {
			this.fs.exist(_opts, (err, found) => {
				if (err)
					return reject(err);

				resolve(found);
			});
		});
	}

	remove(opts) {

		let _opts = this.parseOpts(opts);

		return new Promise((resolve, reject) => {
			this.fs.remove(_opts, (err) => {
				if (err)
					return reject(err);

				resolve();
			});
		});
	}
}
