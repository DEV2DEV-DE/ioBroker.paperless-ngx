
class directorieshandlerClass {
	constructor(adapter) {
		this.adapter = adapter;
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
					if(typeof obj[elementName] === "object" && obj[elementName] && obj[elementName][0]){
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
					else{
						let stateVal = obj[elementName];
						let objectId = `${startDirectory}.${elementName}`;
						if(objectId.indexOf(".") === 0){
							objectId = objectId.substring(1,objectId.length);
						}

						await this.adapter.extendObjectAsync(objectId,{
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
						if(typeof stateVal === "object"){
							stateVal = JSON.stringify(stateVal);
						}
						if(stateVal !== undefined){
							// Set State from Objectpath
							await this.adapter.setStateAsync(`${objectId}`,stateVal,true);
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