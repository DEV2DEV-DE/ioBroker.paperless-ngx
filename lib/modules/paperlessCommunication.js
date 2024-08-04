
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
			present: {},
			address: "tags/",
			startDirectory: "tags",
			basic:[{
				id:"count",
				type:"state",
				common:{
					name: "count of present tags",
					type: "number",
					role: "value"
				},
				native: {}
			}],
			readOutLevel: this.adapter.config.tagsLoglevel,
			dataindex: "name"
		};

		this.documents = {
			present: {},
			address: "documents/",
			startDirectory: "documents",
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

		this.searchQuery = {
			address: "search/?query=",
			startDirectory: "search.results",
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

				await this.readData(this.tags);
				await this.directoryhandler.deleteNotPresentSubfolders(this.tags);

				await this.readData(this.documents);
				await this.directoryhandler.deleteNotPresentSubfolders(this.documents);

				await this.readData(this.document_types);
				await this.directoryhandler.deleteNotPresentSubfolders(this.document_types);

				this.readInProgress = false;
			}
			catch(error){
				this.readInProgress = false;
				this.adapter.log.error(`error at ${activeFunction}:  ${error}`);
			}
		}
	}

	async readData(datainformation){
		const activeFunction = "readData - " + datainformation.startDirectory;
		this.adapter.log.debug(`Function ${activeFunction} started.`);
		try{
			if(datainformation.readOutLevel !== 0){
				const erg = await axios.get(this.address + this.api.address + datainformation.address,this.authorisation);
				if(erg.data){
					// delete the present data
					datainformation.present = {};
					// Write the basic states
					for(const basicstate of datainformation.basic){
						await this.adapter.extendObjectAsync(`${datainformation.startDirectory}.${basicstate.id}`,basicstate);
						await this.adapter.setStateAsync(`${datainformation.startDirectory}.${basicstate.id}`,erg.data[basicstate.id],true);
					}

					// assign the detailed values
					if(datainformation.readOutLevel === 2){
						for(const data of erg.data.results){
							datainformation.present[data[datainformation.dataindex]] = {};
							await this.directoryhandler.generateRekursivObjects(data,`${datainformation.startDirectory}.${data[datainformation.dataindex]}`);
						}
					}
				}
			}
		}
		catch(error){
			if(JSON.stringify(error).indexOf("403") !== -1){
				this.adapter.log.warn(`Read Data ${datainformation.startDirectory} is forbidden. Please deactivate in the config`);
			}
			else{
				this.adapter.log.error(`error at ${activeFunction}:  ${error}`);
			}
		}
	}

	/******************************************************************************************************
 * ****************************************************************************************************
**************************************************************************************************** */

	async sendSearchQuery(query){
		const activeFunction = "sendSearchQuery - " + query;
		this.adapter.log.debug(`Function ${activeFunction} started.`);
		try{
			const erg = await axios.get(`${this.address}${this.api.address}${this.searchQuery.address}${query}`,this.authorisation);

			// set the folders and states for the results
			await this.directoryhandler.generateRekursivObjects(erg.data,this.searchQuery.startDirectory);
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