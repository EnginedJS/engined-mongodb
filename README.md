# engined-mongodb

mongodb agent service for engined, which is based on mongoose.

[![NPM](https://nodei.co/npm/engined-mongodb.png)](https://nodei.co/npm/engined-mongodb/)

## Installation

Install via NPM:

```shell
npm install engined-mongodb
```

## Usage

start mongodb agent service in engined, see example below:

```javascript
const { Manager } = require('engined');
const MongoDBService = require('engined-mongodb');

const MyMongoDB = MongoDBService({
	agentName: 'MyMongoDB', // optional: default to 'default' if not set
	schemaPath: __dirname + '/models', // optinal: default to null if not set
	uri: 'mongodb://localhost:21017/mydb'
});

const main = async () => {

	// Create manager
	let serviceManager = new Manager({ verbose: true });

	// Adding agent to manager
	serviceManager.add('MyMongoDB', MyMongDB);

	// Start all services
	await serviceManager.startAll();
};

main();
```

## Access MongoDB

Pretty easy to get agent from context and specify collection to get mongoose model. Then just operate database by mongoose way.

```javascript
let agent = this.getContext('MongoDB').getAgent('MyMongoDB');

// Mongoose way to operate database
let docs = await agent.model('MyCollection').find({});
```

## License
Licensed under the MIT License

## Authors
Copyright(c) 2017 Fred Chien（錢逢祥） <<cfsghost@gmail.com>>
