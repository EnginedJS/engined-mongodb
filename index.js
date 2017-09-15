const url = require('url');
const { Service } = require('engined');
const MongoAgent = require('./lib/agent');

module.exports = (opts = {}) => class extends Service {

	constructor(context) {
		super(context);

		this.uri = opts.uri || null;
		this.agentName = opts.agentName || 'default';
		this.dbName = opts.database || null;
		this.schemaPath = opts.schemaPath || null;
		this.agent = null;
	}

	async start() {
		if (!this.uri) {
			throw new Error('Failed to initialize agent.', 'No specific URI');
		}

		if (!this.dbName) {
			let urlObj = url.parse(this.uri);
			if (urlObj.pathname === null || urlObj.pathname === '/')
				throw new Error('Failed to initialize agent.', 'No specific database');

			this.dbName = urlObj.pathname.replace('/', '');
		}

		// Create agent
		let agent = this.agent = new MongoAgent(this.getContext(), this.dbName, this.schemaPath);

		try {
			// Register on context object
			this.getContext()
				.assert('MongoDB')
				.register(this.agentName, this.agent);
		} catch(e) {
			throw new Error('Failed to initialize agent.', this.agentName + ' agent exists already');
		}

		// Connect to database
		await agent.connect(this.uri);
	}

	async stop() {
		if (this.agent === null)
			return;

		// Disconnect
		await this.agent.disconnect();

		this.agent = null;

		// Getting agent member
		let agentManager = this.getContext().get('MongoDB');
		if (!agentManager)
			return;

		// Take off agent from context
		agentManager.unregister(this.agentName);

		if (agentManager.count() === 0)
			this.getContext().remove('MongoDB');
	}
}
