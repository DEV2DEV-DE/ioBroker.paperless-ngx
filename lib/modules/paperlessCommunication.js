
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

		this.search = {
			present: {},
			address: "search/?query=",
			startDirectory: "search",
			startDirectoryBasic: "search.results",
			readOutLevel: 1
		};

		this.tags = {
			present: {},
			address: "tags/",
			startDirectory: "tags",
			startDirectoryBasic: "tags.basic",
			startDirectoryDetailed: "tags.detailed",
			readOutLevel: this.adapter.config.tagsLoglevel
		};

		this.documents = {
			present: {},
			address: "documents/",
			startDirectory: "documents",
			startDirectoryBasic: "documents.basic",
			startDirectoryDetailed: "documents.detailed",
			basic:[{
				id:"count",
				type:"state",
				common:{
					name: "count of present documents",
					type: "number",
					role: "value"
				},
				native: {}
			}],
			readOutLevel: this.adapter.config.documentsLoglevel,
			dataindex: "title"
		};

		this.document_types = {
			present: {},
			address: "document_types/",
			startDirectory: "document_types",
			startDirectoryBasic: "document_types.basic",
			startDirectoryDetailed: "document_types.detailed",
			basic:[{
				id:"count",
				type:"state",
				common:{
					name: "count of present document types",
					type: "number",
					role: "value"
				},
				native: {}
			}],
			readOutLevel: this.adapter.config.documentTypesLoglevel,
			dataindex: "name"
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

				await this.readTags();
				await this.directoryhandler.deleteNotPresentSubfolders(this.tags);

				await this.readDocuments();
				await this.directoryhandler.deleteNotPresentSubfolders(this.documents);

				await this.readDocumentTypes();
				await this.directoryhandler.deleteNotPresentSubfolders(this.document_types);

				this.readInProgress = false;
			}
			catch(error){
				this.readInProgress = false;
				this.adapter.log.error(`error at ${activeFunction}:  ${error}`);
			}
		}
	}

	async readTags(){
		const activeFunction = "readTags";
		this.adapter.log.debug(`Function ${activeFunction} started.`);
		try{
			if(this.tags.readOutLevel !== 0){
				let erg = await axios.get(this.address + this.api.address + this.tags.address,this.authorisation);
				if(erg.data){
					// delete the present data
					this.tags.present = {"tags.basic":{},"tags.detailed":{}};

					//Assign the Basicstructure
					this.tags.basicStructure = {};
					this.tags.basicStructure.count = erg.data.count;

					//Assign Detailedstructure
					this.tags.detailedStructure = [];
					for(const result of erg.data.results){
						this.tags.detailedStructure.push(result);
					}
					while(erg.data.next){
						erg = await axios.get(erg.data.next,this.authorisation);
						if(erg.data){
							for(const result of erg.data.results){
								this.tags.detailedStructure.push(result);
							}
						}
					}
					// Assign Data
					await this.assignData(this.tags);
				}
			}
		}
		catch(error){
			if(JSON.stringify(error).indexOf("403") !== -1){
				this.adapter.log.warn(`Read Data ${this.tags.startDirectory} is forbidden. Please deactivate in the config`);
			}
			else{
				this.adapter.log.error(`error at ${activeFunction}:  ${error}`);
			}
		}
	}

	async readDocuments(){
		const activeFunction = "readDocuments";
		this.adapter.log.debug(`Function ${activeFunction} started.`);
		try{
			if(this.documents.readOutLevel !== 0){
				let erg = await axios.get(this.address + this.api.address + this.documents.address,this.authorisation);
				if(erg.data){
					// delete the present data
					this.documents.present = {"documents.basic":{},"documents.detailed":{}};

					//Assign the Basicstructure
					this.documents.basicStructure = {};
					this.documents.basicStructure.count = erg.data.count;

					//Assign Detailedstructure
					this.documents.detailedStructure = [];
					for(const result of erg.data.results){
						this.documents.detailedStructure.push(result);
					}
					while(erg.data.next){
						erg = await axios.get(erg.data.next,this.authorisation);
						if(erg.data){
							for(const result of erg.data.results){
								this.documents.detailedStructure.push(result);
							}
						}
					}

					// Assign Data
					await this.assignData(this.documents);
				}
			}
		}
		catch(error){
			if(JSON.stringify(error).indexOf("403") !== -1){
				this.adapter.log.warn(`Read Data ${this.documents.startDirectory} is forbidden. Please deactivate in the config`);
			}
			else{
				this.adapter.log.error(`error at ${activeFunction}:  ${error}`);
			}
		}
	}

	async readDocumentTypes(){
		const activeFunction = "readDocumentTypes";
		this.adapter.log.debug(`Function ${activeFunction} started.`);
		try{
			if(this.document_types.readOutLevel !== 0){
				let erg = await axios.get(this.address + this.api.address + this.document_types.address,this.authorisation);
				if(erg.data){
					// delete the present data
					this.document_types.present = {"document_types.basic":{},"document_types.detailed":{}};

					//Assign the Basicstructure
					this.document_types.basicStructure = {};
					this.document_types.basicStructure.count = erg.data.count;

					//Assign Detailedstructure
					this.document_types.detailedStructure = [];
					for(const result of erg.data.results){
						this.document_types.detailedStructure.push(result);
					}
					while(erg.data.next){
						erg = await axios.get(erg.data.next,this.authorisation);
						if(erg.data){
							for(const result of erg.data.results){
								this.document_types.detailedStructure.push(result);
							}
						}
					}

					// Assign Data
					await this.assignData(this.document_types);
				}
			}
		}
		catch(error){
			if(JSON.stringify(error).indexOf("403") !== -1){
				this.adapter.log.warn(`Read Data ${this.document_types.startDirectory} is forbidden. Please deactivate in the config`);
			}
			else{
				this.adapter.log.error(`error at ${activeFunction}:  ${error}`);
			}
		}
	}

	async assignData(datainformation){
		const activeFunction = "assignData  -" + datainformation.startDirectory;
		this.adapter.log.debug(`Function ${activeFunction} started.`);
		try{
			if(datainformation.readOutLevel !== 0){
				// Basic
				if(datainformation.basicStructure){
					await this.directoryhandler.generateRekursivObjects(datainformation.basicStructure,`${datainformation.startDirectoryBasic}`,datainformation);
				}

				// Detailed
				if(datainformation.readOutLevel >= 2){
					if(datainformation.detailedStructure){
						await this.directoryhandler.generateRekursivObjects(datainformation.detailedStructure,`${datainformation.startDirectoryDetailed}`,datainformation);
					}
				}

				if(datainformation.readOutLevel >= 3){
					// Remaining
					if(datainformation.remainingStructure){
						await this.directoryhandler.generateRekursivObjects(datainformation.remainingStructure,`${datainformation.startDirectoryRemaining}`,datainformation.present);
					}
				}
			}
		}
		catch(error){
			this.adapter.log.error(`error at ${activeFunction}:  ${error}`);
		}
	}

	/******************************************************************************************************
 * ****************************************************************************************************
**************************************************************************************************** */

	async sendSearchQuery(query){
		const activeFunction = "sendSearchQuery - " + query;
		this.adapter.log.debug(`Function ${activeFunction} started.`);
		try{
			const erg = await axios.get(`${this.address}${this.api.address}${this.search.address}${query}`,this.authorisation);

			// delete the present data
			this.search.present = {"search.query":{},"search.results":{}};

			// set the folders and states for the results
			//Assign the Basicstructure
			this.search.basicStructure = erg.data;

			// Assign Data
			await this.assignData(this.search);

			// Delete not assigned ids
			await this.directoryhandler.deleteNotPresentSubfolders(this.search);
		}
		catch(error){
			if(JSON.stringify(error).indexOf("403") !== -1){
				this.adapter.log.warn(`Send Query is forbidden.`);
			}
			else{
				this.adapter.log.error(`error at ${activeFunction}:  ${error}`);
			}
		}
	}
}
module.exports = paperlesscommunicationClass;