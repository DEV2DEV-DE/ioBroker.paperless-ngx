
class directorieshandlerClass {
	constructor(adapter) {
		this.adapter = adapter;
		this.adapterObjects = {};
	}

	async generateRekursivObjects(obj,startDirectory){
		const activeFunction = "generateRekursivObjects";
		this.adapter.log.debug(`Function ${activeFunction} started.`);
		try{
			// just proceed with ojects
			if(typeof obj === "object"){
				// go to every element in the object
				for(const elementName in obj){
					// Check the the elementname is not in ignored object
					// Check if the element is an object
					if(typeof obj[elementName] === "object"){
						if(obj[elementName] && obj[elementName][0]){
							// Generate the desired id
							let objectId = `${startDirectory}.${elementName}`;
							if(objectId.indexOf(".") === 0){
								objectId = objectId.substring(1,objectId.length);
							}
							// check object exists
							if(await this.adapter.objectExists(objectId)){
								this.adapter.log.silly(`object ${objectId} exists. Goto next level`);
								await this.generateRekursivObjects(obj[elementName],objectId);
								return;
							}
							else{
								this.adapter.log.silly(`object ${objectId} not exists`);
							}

							this.adapter.log.debug(`set object ${objectId}`);
							await this.adapter.setObjectAsync(objectId,{
								type: "folder",
								common: {
									name: elementName,
								},
								native: {},
							});
							// Jump into next step (next directory / attribute)
							await this.generateRekursivObjects(obj[elementName],objectId);
						}
					}
					else{
						let objectId = `${startDirectory}.${elementName}`;
						if(objectId.indexOf(".") === 0){
							objectId = objectId.substring(1,objectId.length);
						}
						if(!await this.adapter.objectExists(objectId)){
							this.adapter.log.silly(`State ${objectId} does not exists.`);
							await this.adapter.setObjectAsync(objectId,{
								type: "state",
								common: {
									type: typeof obj[elementName],
									name: elementName,
									role: "value",
									read: true,
									write: false
								},
								native: {},
							});
						}
						else{
							this.adapter.log.silly(`State ${objectId} exists. Goto write State`);
						}
						if(obj[elementName] !== undefined){
							// Set State from Objectpath
							await this.adapter.setStateAsync(`${objectId}`,obj[elementName],true);
						}
					}
				}
			}
		}
		catch(error){
			this.adapter.log.error(`error at ${activeFunction}:  ${error}`);
		}
	}

	async getAdapterObjects(){
		this.adapterObjects = await this.adapter.getAdapterObjectsAsync();
	}

	async deleteNotPresentSubfolders(foldertype){
		const activeFunction = "deleteNotPresentSubfolders - " + foldertype.startDirectory;
		this.adapter.log.debug(`Function ${activeFunction} started.`);
		try{
			for(const adapterObject of Object.values(this.adapterObjects)){
				if(adapterObject._id.indexOf(`${this.adapter.namespace}.${foldertype.startDirectory}.`) === 0){
					const idWithoutStart = adapterObject._id.substring(`${this.adapter.namespace}.${foldertype.startDirectory}.`.length,adapterObject._id.length);
					let firstString = idWithoutStart;
					const indexOfFistDot = idWithoutStart.indexOf(".");
					if(indexOfFistDot !== -1){
						firstString = idWithoutStart.substring(0,indexOfFistDot);
						if(!foldertype.present[firstString]){
							await this.adapter.delObjectAsync(adapterObject._id);
						}
					}
					else{
						if(adapterObject.type === "folder" || foldertype.readOutLevel === 0){
							await this.adapter.delObjectAsync(adapterObject._id);
						}
					}
				}
			}
		}
		catch(error){
			this.adapter.log.error(`error at ${activeFunction}:  ${error}`);
		}
	}
}

module.exports = directorieshandlerClass;