const mongoose = require('mongoose');
const GridFS = require('./gridfs');

mongoose.Promise = Promise;

module.exports = class MongoAgent {

	constructor(ctx, dbName, schemaPath) {

		this.dbName = dbName;
		this.schemaPath = schemaPath || null;
		this.connection = null;
		this.defaultSchema = mongoose.Schema({
		}, {
			strict: false,
			minimize: false,
			versionKey: false
		});
		this.cache = {};
		this.registered = [];
	}

	async connect(uri) {
		let connection = this.connection = await mongoose.createConnection(uri, {
			server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } }
		});
		console.log('<MongoAgent>', 'Connected to', connection.host + ':' + connection.port + '/' + connection.name);

		connection.on('timeout', (err) => {
			console.log('TIMEOUT!!!!!', err);
		});
	}

	async disconnect() {
		if (this.connection === null)
			return;

		await this.connection.disconnect();

		this.connection = null;
	}

	schema(_schema, opts) {

		return mongoose.Schema(_schema, opts || {
			strict: false,
			minimize: false,
			versionKey: false
		});
	}

	type(name) {
		return mongoose.Types[name];
	}

	_loadRefereces(refs) {
		refs.forEach((ref) => {
			if (this.registered.indexOf(ref) === -1)
				return this.model(ref);
		});
	}
	
	model(name, schema) {
		
		if (this.registered.indexOf(name) === -1)
			this.registered.push(name);

		if (this.cache[name])
			return this.cache[name];

		if (schema) {
			return this.connection.model(name, schema, name);
		}

		let model = null;
		try {
			if (!this.schemaPath)
				throw new Error('No schema path');

			let _model = require(this.schemaPath + '/' + name);

			if (_model.references)
				this._loadReferences(_model.references);
			
			// Create schema object
			let _schema = this.schema(_model.schema, _model.opts);

			// Indexing
			if (_model.indexes) {
				_model.indexes.forEach((index) => {
					_schema.index(index);
				});
			}

			model = this.cache[name] = this.connection.model(_model.collectionName, _schema, _model.collectionName);
		} catch(e) {
			console.log('err', e);
			model = this.cache[name] = this.lazyModel(name);
		}

		return model;
	}

	lazyModel(name) {

		return this.connection.model(name, this.defaultSchema);
	}

	gridfs(namespace) {
		if (!gridStream)
			throw new Error('No GridFS support, please install \'gridfs-stream\' module.');

		return new GridFS(this, namespace);
	}
};
