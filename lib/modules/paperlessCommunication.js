
const axios = require("axios");
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

		this.readInProgress = false;
	}

	async readActualData(){
		if(!this.readInProgress){
			const activeFunction = "readActualData";
			this.adapter.log.debug(`Function ${activeFunction} started.`);
			try{
				this.readInProgress = true;
				await this.directoryhandler.getAdapterObjects();

				if(this.adapter.config.withTags){
					await this.readTags();
				}
				await this.directoryhandler.checkDirectory(this.tags.startDirectory,this.tags.active);

				if(this.adapter.config.withDocuments){
					await this.readDocuments();
				}
				await this.directoryhandler.checkDirectory(this.documents.startDirectory,this.documents.active);
				this.readInProgress = false;
			}
			catch(error){
				this.readInProgress = false;
				this.adapter.log.error(`error at ${activeFunction}:  ${error}`);
			}
		}
	}

	async readTags(){
		try{
			const erg = await axios.get(this.address + this.api.address + this.tags.address,this.authorisation);
			if(erg.data){
				this.tags.active = {count:{}};
				// Write the tag count
				const countId = `${this.tags.startDirectory}.count`;
				await this.adapter.setObjectAsync(countId,{
					type: "state",
					common: {
						type: "number",
						name: "count",
						role: "value",
						read: true,
						write: false
					},
					native: {},
				});
				await this.adapter.setStateAsync(countId,erg.data.count,true);
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
				this.documents.active = {count:{}};
				// Write the document count
				const countId = `${this.documents.startDirectory}.count`;
				await this.adapter.setObjectAsync(countId,{
					type: "state",
					common: {
						type: "number",
						name: "count",
						role: "value",
						read: true,
						write: false
					},
					native: {},
				});
				await this.adapter.setStateAsync(countId,erg.data.count,true);
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