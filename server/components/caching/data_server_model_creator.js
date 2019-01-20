'use strict';

/**
 * @brief	Creates a new Data Server model
 *
 * @param	DataServer dataServer
 * @param	String namespace
 * @param	Object options
 *
 * @return	Object
 */
module.exports	= function ( dataServer, namespace, validationSchema = {} )
{
	/**
	 * @brief	Data server model that is attached to a specific namespace and can easily create and save data there.
	 */
	class ModelClass
	{
		/**
		 * @param	String recordName
		 * @param	Object recordData
		 * @param	Options recordOptions
		 */
		constructor( recordName, recordData = {}, recordOptions = {} )
		{
			this.recordName		= recordName;
			this.recordData		= recordData;
			this.recordOptions	= recordOptions;
		}

		/**
		 * @brief	Saves the data of the current Model
		 *
		 * @details	This will save the current state of the object and will attempt to save that.
		 * 			This is done so you can change it immediately after and save the new model
		 * 			This will not create the namespace if it does not exist
		 *
		 * @return	Promise
		 */
		save()
		{
			let recordName		= this.recordName;
			let recordData		= this.recordData;
			let recordOptions	= this.recordOptions;

			return new Promise(( resolve, reject )=>{
				dataServer.create( namespace, recordName, recordData, recordOptions ).then(()=>{
					resolve( false );
				}).catch( reject );
			});
		}

		/**
		 * @brief	Removes the namespace if it exists
		 *
		 * @return	Promise
		 */
		static removeNamespaceIfExists()
		{
			return new Promise(( resolve, reject )=>{
				dataServer.existsNamespace( namespace ).then(( exists )=>{
					if ( ! exists )
					{
						dataServer.removeNamespace( namespace ).then(()=>{
							resolve( false );
						}).catch( reject );
					}
					else
					{
						resolve( false );
					}
				}).catch( reject );
			});
		}

		/**
		 * @brief	Attempts to create the model's namespace if it does not exist
		 *
		 * @details	If the namespace exists, do nothing
		 *
		 * @return	Promise
		 */
		static createNamespaceIfNotExists()
		{
			return new Promise(( resolve, reject )=>{
				dataServer.existsNamespace( namespace ).then(( exists )=>{
					if ( ! exists )
					{
						dataServer.createNamespace( namespace ).then(()=>{
							resolve( false );
						}).catch( reject );
					}
					else
					{
						resolve( false );
					}
				}).catch( reject );
			});
		}

		/**
		 * @brief	Always creates a new namespace
		 *
		 * @details	Will remove it if it already exists
		 *
		 * @return	Promise
		 */
		static createNamespace()
		{
			return new Promise(( resolve, reject )=>{
				dataServer.existsNamespace( namespace ).then(( exists )=>{
					if ( ! exists )
					{
						dataServer.createNamespace( namespace ).then(()=>{
							resolve( false );
						}).catch( reject );
					}
					else
					{
						dataServer.removeNamespace( namespace ).then(()=>{
							dataServer.createNamespace( namespace ).then(()=>{
								resolve( false );
							}).catch( reject );
						}).catch( reject );
					}
				}).catch( reject );
			});
		}

		/**
		 * @brief	Finds one entry in the data server
		 *
		 * @details	The promise will resolve to either a ModelClass or null if nothing is found
		 *
		 * @param	String recordName
		 *
		 * @return	Promise
		 */
		static find( recordName )
		{
			return new Promise( ( resolve, reject )=>{
				dataServer.read( namespace, recordName ).then(( data )=>{
					resolve( new ModelClass( recordName, data ) );
				}).catch(()=>{
					resolve( null );
				});
			})
		}
	}

	return ModelClass;
};