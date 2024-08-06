
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
			datastructure : {},
			readOutLevel: 1
		};

		this.tags = {
			present: {},
			address: "tags/",
			startDirectory: "tags",
			datastructure : {},
			readOutLevel: this.adapter.config.tagsLoglevel
		};

		this.documents = {
			present: {},
			address: "documents/",
			startDirectory: "documents",
			datastructure : {},
			readOutLevel: this.adapter.config.documentsLoglevel,
		};

		this.document_types = {
			present: {},
			address: "document_types/",
			startDirectory: "document_types",
			datastructure : {},
			readOutLevel: this.adapter.config.documentTypesLoglevel,
		};

		this.users = {
			present: {},
			address: "users/",
			startDirectory: "users",
			datastructure : {},
			readOutLevel: this.adapter.config.usersLoglevel,
		};

		this.readInProgress = false;
	}

	expandIndex(surceindex){
		const doubleZero = "00";
		return (doubleZero + surceindex).slice(-3);
	}

	/******************************************************************************************************
 	* *****************************************************************************************************
	**************************************************************************************************** */

	async readActualData(){
		if(!this.readInProgress){
			const activeFunction = "readActualData";
			this.adapter.log.debug(`Function ${activeFunction} started.`);
			try{
				this.readInProgress = true;
				await this.directoryhandler.getAdapterObjects();

				await this.readTags();

				await this.readDocuments();

				await this.readDocumentTypes();

				await this.readUsers();

				this.readInProgress = false;
			}
			catch(error){
				this.readInProgress = false;
				this.adapter.log.error(`error at ${activeFunction}:  ${error}`);
			}
		}
	}

	/******************************************************************************************************
 	* *****************************************************************************************************
	**************************************************************************************************** */

	async readTags(){
		const activeFunction = "readTags";
		this.adapter.log.debug(`Function ${activeFunction} started.`);
		try{
			if(this.tags.readOutLevel !== 0){
				let erg = await axios.get(this.address + this.api.address + this.tags.address,this.authorisation);
				if(erg.data){
					// delete the present data
					this.tags.present = {"tags.basic":{},"tags.detailed":{}};

					//Assigns general datastructure
					this.tags.datastructure = {
						basic: {},
						detailed: {}
					};

					//Assign the Basicstructure
					this.tags.datastructure.basic.count = erg.data.count;

					if(this.tags.readOutLevel >= 2){
						//Assign Detailedstructure
						for(const result of erg.data.results){
							this.tags.datastructure.detailed[this.expandIndex(result.id)] = result;
						}
						while(erg.data.next){
							erg = await axios.get(erg.data.next,this.authorisation);
							if(erg.data){
								for(const result of erg.data.results){
									this.tags.datastructure.detailed[this.expandIndex(result.id)] = result;
								}
							}
						}
					}

					// Assign Data
					await this.assignData(this.tags);

					// Delete not assigned ids
					await this.directoryhandler.deleteNotPresentSubfolders(this.tags);
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

	/******************************************************************************************************
 	* *****************************************************************************************************
	**************************************************************************************************** */

	async readDocuments(){
		const activeFunction = "readDocuments";
		this.adapter.log.debug(`Function ${activeFunction} started.`);
		try{
			if(this.documents.readOutLevel !== 0){
				let erg = await axios.get(this.address + this.api.address + this.documents.address,this.authorisation);
				if(erg.data){
					// delete the present data
					this.documents.present = {"tags.basic":{},"tags.detailed":{}};

					//Assigns general datastructure
					this.documents.datastructure = {
						basic: {},
						detailed: {}
					};

					//Assign the Basicstructure
					this.documents.datastructure.basic.count = erg.data.count;

					if(this.documents.readOutLevel >= 2){
						//Assign Detailedstructure
						for(const result of erg.data.results){
							this.documents.datastructure.detailed[this.expandIndex(result.id)] = result;
						}
						while(erg.data.next){
							erg = await axios.get(erg.data.next,this.authorisation);
							if(erg.data){
								for(const result of erg.data.results){
									this.documents.datastructure.detailed[this.expandIndex(result.id)] = result;
								}
							}
						}
					}

					// Assign Data
					await this.assignData(this.documents);

					// Delete not assigned ids
					await this.directoryhandler.deleteNotPresentSubfolders(this.documents);
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

	/******************************************************************************************************
 	* *****************************************************************************************************
	**************************************************************************************************** */

	async readDocumentTypes(){
		const activeFunction = "readDocumentTypes";
		this.adapter.log.debug(`Function ${activeFunction} started.`);
		try{
			if(this.document_types.readOutLevel !== 0){
				let erg = await axios.get(this.address + this.api.address + this.document_types.address,this.authorisation);
				if(erg.data){
					// delete the present data
					this.document_types.present = {"tags.basic":{},"tags.detailed":{}};

					//Assigns general datastructure
					this.document_types.datastructure = {
						basic: {},
						detailed: {}
					};

					//Assign the Basicstructure
					this.document_types.datastructure.basic.count = erg.data.count;

					if(this.document_types.readOutLevel >= 2){
						//Assign Detailedstructure
						for(const result of erg.data.results){
							this.document_types.datastructure.detailed[this.expandIndex(result.id)] = result;
						}
						while(erg.data.next){
							erg = await axios.get(erg.data.next,this.authorisation);
							if(erg.data){
								for(const result of erg.data.results){
									this.document_types.datastructure.detailed[this.expandIndex(result.id)] = result;
								}
							}
						}
					}

					// Assign Data
					await this.assignData(this.document_types);

					// Delete not assigned ids
					await this.directoryhandler.deleteNotPresentSubfolders(this.document_types);
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

	/******************************************************************************************************
 	* *****************************************************************************************************
	**************************************************************************************************** */

	async readUsers(){
		const activeFunction = "readUsers";
		this.adapter.log.debug(`Function ${activeFunction} started.`);
		try{
			if(this.users.readOutLevel !== 0){
				let erg = await axios.get(this.address + this.api.address + this.users.address,this.authorisation);
				if(erg.data){
					// delete the present data
					this.users.present = {"tags.basic":{},"tags.detailed":{}};

					//Assigns general datastructure
					this.users.datastructure = {
						basic: {},
						detailed: {}
					};

					//Assign the Basicstructure
					this.users.datastructure.basic.count = erg.data.count;

					if(this.users.readOutLevel >= 2){
						//Assign Detailedstructure
						for(const result of erg.data.results){
							this.users.datastructure.detailed[this.expandIndex(result.id)] = result;
						}
						while(erg.data.next){
							erg = await axios.get(erg.data.next,this.authorisation);
							if(erg.data){
								for(const result of erg.data.results){
									this.users.datastructure.detailed[this.expandIndex(result.id)] = result;
								}
							}
						}
					}

					// Assign Data
					await this.assignData(this.users);

					// Delete not assigned ids
					await this.directoryhandler.deleteNotPresentSubfolders(this.users);
				}
			}
		}
		catch(error){
			if(JSON.stringify(error).indexOf("403") !== -1){
				this.adapter.log.warn(`Read Data ${this.users.startDirectory} is forbidden. Please deactivate in the config`);
			}
			else{
				this.adapter.log.error(`error at ${activeFunction}:  ${error}`);
			}
		}
	}

	/******************************************************************************************************
 	* *****************************************************************************************************
	**************************************************************************************************** */

	async assignData(datainformation){
		const activeFunction = "assignData  -" + datainformation.startDirectory;
		this.adapter.log.debug(`Function ${activeFunction} started.`);
		try{
			await this.directoryhandler.generateRekursivObjects(datainformation.datastructure,`${datainformation.startDirectory}`,datainformation);
		}
		catch(error){
			this.adapter.log.error(`error at ${activeFunction}:  ${error}`);
		}
	}

	/******************************************************************************************************
 	* *****************************************************************************************************
	**************************************************************************************************** */
	/******************************************************************************************************
 	* *****************************************************************************************************
	**************************************************************************************************** */

	async sendSearchQuery(query){
		const activeFunction = "sendSearchQuery - " + query;
		this.adapter.log.debug(`Function ${activeFunction} started.`);
		try{
			const erg = await axios.get(`${this.address}${this.api.address}${this.search.address}${query}`,this.authorisation);

			// delete the present data
			this.search.present = {"search.query":{},"search.results":{}};

			// set the folders and states for the results
			//Assign the Datastructure
			this.search.datastructure = {
				results: {}
			};

			// Assign Count
			this.search.datastructure.results.total = erg.data.total;

			// Assign the whole structure
			for(const element in erg.data){
				this.search.datastructure.results[element] = {};
				if(typeof erg.data[element] !== "object"){
					this.search.datastructure.results[element] = erg.data[element];
				}
				else{
					for(const elementdata of erg.data[element]){
						this.search.datastructure.results[element][this.expandIndex(elementdata.id)] = elementdata;
					}
				}
			}

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