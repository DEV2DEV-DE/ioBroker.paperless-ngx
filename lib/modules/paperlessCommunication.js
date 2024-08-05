
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

	defineIndex(surceindex){
		const doubleZero = "00";
		return (doubleZero + surceindex).slice(-3);
	}

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
							this.tags.datastructure.detailed[this.defineIndex(result.id)] = result;
						}
						while(erg.data.next){
							erg = await axios.get(erg.data.next,this.authorisation);
							if(erg.data){
								for(const result of erg.data.results){
									this.tags.datastructure.detailed[this.defineIndex(result.id)] = result;
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
							this.documents.datastructure.detailed[this.defineIndex(result.id)] = result;
						}
						while(erg.data.next){
							erg = await axios.get(erg.data.next,this.authorisation);
							if(erg.data){
								for(const result of erg.data.results){
									this.documents.datastructure.detailed[this.defineIndex(result.id)] = result;
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
							this.document_types.datastructure.detailed[this.defineIndex(result.id)] = result;
						}
						while(erg.data.next){
							erg = await axios.get(erg.data.next,this.authorisation);
							if(erg.data){
								for(const result of erg.data.results){
									this.document_types.datastructure.detailed[this.defineIndex(result.id)] = result;
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
							this.users.datastructure.detailed[this.defineIndex(result.id)] = result;
						}
						while(erg.data.next){
							erg = await axios.get(erg.data.next,this.authorisation);
							if(erg.data){
								for(const result of erg.data.results){
									this.users.datastructure.detailed[this.defineIndex(result.id)] = result;
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
			//Assign the Datastructure
			this.search.datastructure = {
				results: {}
			};

			// Assign Count
			this.search.datastructure.results.total = erg.data.total;

			// Assign Documents
			for(const document of erg.data.documents){
				if(!this.search.datastructure.results.documents){
					this.search.datastructure.results.documents = {};
				}
				this.search.datastructure.results.documents[this.defineIndex(document.id)] = document;
			}

			// Assign saved_views
			for(const saved_view of erg.data.saved_views){
				if(!this.search.datastructure.results.saved_views){
					this.search.datastructure.results.saved_views = {};
				}
				this.search.datastructure.results.saved_views[this.defineIndex(saved_view.id)] = saved_view;
			}

			// Assign tags
			for(const tag of erg.data.tags){
				if(!this.search.datastructure.results.tags){
					this.search.datastructure.results.tags = {};
				}
				this.search.datastructure.results.tags[this.defineIndex(tag.id)] = tag;
			}

			// Assign correspondents
			for(const correspondent of erg.data.correspondents){
				if(!this.search.datastructure.results.correspondents){
					this.search.datastructure.results.correspondents = {};
				}
				this.search.datastructure.results.correspondents[this.defineIndex(correspondent.id)] = correspondent;
			}

			// Assign document_types
			for(const document_type of erg.data.document_types){
				if(!this.search.datastructure.results.document_types){
					this.search.datastructure.results.document_types = {};
				}
				this.search.datastructure.results.document_types[this.defineIndex(document_type.id)] = document_type;
			}

			// Assign storage_paths
			for(const storage_path of erg.data.storage_paths){
				if(!this.search.datastructure.results.storage_paths){
					this.search.datastructure.results.storage_paths = {};
				}
				this.search.datastructure.results.storage_paths[this.defineIndex(storage_path.id)] = storage_path;
			}

			// Assign users
			for(const user of erg.data.users){
				if(!this.search.datastructure.results.users){
					this.search.datastructure.results.users = {};
				}
				this.search.datastructure.results.users[this.defineIndex(user.id)] = user;
			}

			// Assign groups
			for(const group of erg.data.groups){
				if(!this.search.datastructure.results.groups){
					this.search.datastructure.results.groups = {};
				}
				this.search.datastructure.results.groups[this.defineIndex(group.id)] = group;
			}

			// Assign mail_rules
			for(const mail_rule of erg.data.mail_rules){
				if(!this.search.datastructure.results.mail_rules){
					this.search.datastructure.results.mail_rules = {};
				}
				this.search.datastructure.results.mail_rules[this.defineIndex(mail_rule.id)] = mail_rule;
			}

			// Assign mail_accounts
			for(const mail_account of erg.data.mail_accounts){
				if(!this.search.datastructure.results.mail_accounts){
					this.search.datastructure.results.mail_accounts = {};
				}
				this.search.datastructure.results.mail_accounts[this.defineIndex(mail_account.id)] = mail_account;
			}

			// Assign workflows
			for(const workflow of erg.data.workflows){
				if(!this.search.datastructure.results.workflows){
					this.search.datastructure.results.workflows = {};
				}
				this.search.datastructure.results.workflows[this.defineIndex(workflow.id)] = workflow;
			}

			// Assign custom_fields
			for(const custom_field of erg.data.custom_fields){
				if(!this.search.datastructure.results.custom_fields){
					this.search.datastructure.results.custom_fields = {};
				}
				this.search.datastructure.results.custom_fields[this.defineIndex(custom_field.id)] = custom_field;
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