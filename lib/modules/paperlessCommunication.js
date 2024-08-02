
const axios = require("axios").default;
const directorieshandlerClass = require("./directorieshandler");

class paperlesscommunicationClass {
	constructor(adapter){
		this.adapter = adapter;
		this.authorisation = {auth:{username:adapter.config.username,password:adapter.config.password}};
		this.address = `http://${adapter.config.ipUrl}:${adapter.config.port}`;

		this.directoryhandler = new directorieshandlerClass(this.adapter);

		this.api = {
			address: "/api/"
		};

		this.tags = {
			active: {},
			address: "tags/",
			startDirectory: "tags"
		};

		this.documents = {
			active: {},
			address: "documents/",
			startDirectory: "documents"
		};
	}

	async readActualData(){
		const activeFunction = "readActualData";
		this.adapter.log.debug(`Function ${activeFunction} started.`);
		try{
			await this.directoryhandler.getAdapterObjects();

			this.readTags();
			await this.directoryhandler.checkDirectory(this.tags.startDirectory,this.tags.active);

			this.readDocuments();
			await this.directoryhandler.checkDirectory(this.documents.startDirectory,this.documents.active);

			// this.adapter.setTimeout(async () => {
			// 	await this.adapter.readActualData();
			// }, 30000);
		}
		catch(error){
			this.adapter.log.error(`error at ${activeFunction}:  ${error}`);
		}		// Read Data
	}

	async readTags(){
		try{
			const erg = await axios.get(this.address + this.api.address + this.tags.address,this.authorisation);
			if(erg.data){
				this.tags.active = {};
				for(const tag of erg.data.results){
					this.tags.active[tag.name] = {};
					await this.directoryhandler.generateRekursivObjects(tag,`${this.tags.startDirectory}.${tag.name}`);
				}
			}
		}
		catch(e){
			this.adapter.log.error(e);
		}
	}

	async readDocuments(){
		try{
			const erg = await axios.get(this.address + this.api.address + this.documents.address,this.authorisation);
			if(erg.data){
				this.documents.active = {};
				for(const document of erg.data.results){
					this.documents.active[document.title] = {};
					await this.directoryhandler.generateRekursivObjects(document,`${this.documents.startDirectory}.${document.title}`);
				}
			}
		}
		catch(e){
			this.adapter.log.error(e);
		}
	}
}

module.exports = paperlesscommunicationClass;