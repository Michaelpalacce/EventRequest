'use strict';

const SERVER_STATES	= require( './server_states' );

/**
 * @brief	Creates a new Data Server model
 *
 * @param	DataServer dataServer
 * @param	String namespace
 * @param	Object validationSchema
 *
 * @return	Object
 */
module.exports	= function ( dataServer, namespace, validationSchema = {} )
{
	let isServerRunning	= dataServer.getServerState() === SERVER_STATES.running;

	dataServer.on( 'state_change', ( state )=>{
		isServerRunning	= state === SERVER_STATES.running;
	} );

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
		constructor( recordName = '', recordData = {}, recordOptions = {} )
		{
			this.recordName		= recordName;
			this.recordData		= recordData;
			this.recordOptions	= recordOptions;
		}

		/**
		 * @brief	Returns the instance of the DataServer that this module was created from
		 *
		 * @return	DataServer
		 */
		static getDataServer()
		{
			return dataServer;
		}

		/**
		 * @brief	Saves the data of the current Model
		 *
		 * @param	Object options
		 *
		 * @details	This will save the current state of the object and will attempt to save that.
		 * 			This is done so you can change it immediately after and save the new model
		 * 			This will not create the namespace if it does not exist
		 *
		 * @return	Promise
		 */
		save( options = this.recordOptions )
		{
			let recordName		= this.recordName;
			let recordData		= this.recordData;

			return new Promise(( resolve, reject )=>{
				if ( ! isServerRunning )
				{
					reject( 'Server is not running' );
					return;
				}

				dataServer.create( namespace, recordName, recordData, options ).then(()=>{
					resolve( false );
				}).catch( reject );
			});
		}

		/**
		 * @brief	Deletes the current record
		 *
		 * @param	Object options
		 *
		 * @return	Promise
		 */
		delete( options = this.recordOptions )
		{
			let recordName	= this.recordName;

			return new Promise(( resolve, reject )=>{
				if ( ! isServerRunning )
				{
					reject( 'Server is not running' );
					return;
				}

				dataServer.delete( namespace, recordName, options ).then(()=>{
					resolve( false );
				}).catch( reject );
			});
		}

		/**
		 * @brief	Updates the ttl of the record
		 *
		 * @details	If not TTL is specified then the default TTL of the server is used
		 *
		 * @param	Number ttl
		 * @param	Object options
		 *
		 * @return	Promise
		 */
		touch( ttl = 0, options = this.recordOptions )
		{
			let recordName	= this.recordName;
			options.ttl		= ttl;

			return new Promise(( resolve, reject )=>{
				if ( ! isServerRunning )
				{
					reject( 'Server is not running' );
					return;
				}

				dataServer.touch( namespace, recordName, options ).then(()=>{
					resolve( false );
				}).catch( reject );
			});
		}

		/**
		 * @brief	Removes the namespace if it exists
		 *
		 * @param	Object options
		 *
		 * @return	Promise
		 */
		static removeNamespaceIfExists( options = {} )
		{
			return new Promise(( resolve, reject )=>{
				if ( ! isServerRunning )
				{
					reject( 'Server is not running' );
					return;
				}

				ModelClass.existsNamespace( options ).then(( exists )=>{
					if ( ! exists )
					{
						dataServer.removeNamespace( namespace, options ).then(()=>{
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
		static createNamespaceIfNotExists( options = {} )
		{
			return new Promise(( resolve, reject )=>{
				if ( ! isServerRunning )
				{
					reject( 'Server is not running' );
					return;
				}

				ModelClass.existsNamespace( options ).then(( exists )=>{
					if ( ! exists )
					{
						dataServer.createNamespace( namespace, options ).then(()=>{
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
		 * @param	Object options
		 *
		 * @details	Will remove it if it already exists
		 *
		 * @return	Promise
		 */
		static createNamespace( options = {} )
		{
			return new Promise(( resolve, reject )=>{
				if ( ! isServerRunning )
				{
					reject( 'Server is not running' );
					return;
				}

				ModelClass.existsNamespace( options ).then(( exists )=>{
					if ( ! exists )
					{
						dataServer.createNamespace( namespace, options ).then(()=>{
							resolve( false );
						}).catch( reject );
					}
					else
					{
						dataServer.removeNamespace( namespace, options ).then(()=>{
							dataServer.createNamespace( namespace, options ).then(()=>{
								resolve( false );
							}).catch( reject );
						}).catch( reject );
					}
				}).catch( reject );
			});
		}

		/**
		 * @brief	Checks if the namespace exists
		 *
		 * @param	Object options
		 *
		 * @return	Promise
		 */
		static existsNamespace( options = {} )
		{
			return dataServer.existsNamespace( namespace, options );
		}

		/**
		 * @brief	Finds one entry in the data server
		 *
		 * @details	The promise will resolve to either a ModelClass or null if nothing is found
		 *
		 * @param	String recordName
		 * @param	Object options
		 *
		 * @return	Promise
		 */
		static find( recordName, options = {} )
		{
			return new Promise( ( resolve, reject )=>{
				if ( ! isServerRunning )
				{
					reject( 'Server is not running' );
					return;
				}

				dataServer.read( namespace, recordName, options ).then(( data )=>{
					resolve( new ModelClass( recordName, data ) );
				}).catch(()=>{
					resolve( null );
				});
			});
		}

		/**
		 * @brief	Searches for all the records containing the query
		 *
		 * @details	This operation may take a long time
		 * 			The promise resolves in an array of elements. Empty array if nothing was found
		 *
		 * @param	String searchQuery
		 * @param	Object options
		 *
		 * @return	Promise
		 */
		static search( searchQuery, options = {} )
		{
			return new Promise( ( resolve, reject )=>{
				if ( ! isServerRunning )
				{
					reject( 'Server is not running' );
					return;
				}

				dataServer.getAll( namespace, options ).then(( data )=>{
					let keys	= Object.keys( data );
					let models	= [];

					keys.forEach( ( recordName )=>{
						if ( recordName.indexOf( searchQuery ) !== -1 )
						{
							models.push( new ModelClass( recordName, data[recordName] ) );
						}
					});

					resolve( models );
				}).catch( reject );
			});
		}

		/**
		 * @brief	Finds and removes a single entry
		 *
		 * @param	String recordName
		 * @param	Object options
		 *
		 * @return	Promise
		 */
		static findAndRemove( recordName, options = {} )
		{
			return new Promise( ( resolve, reject )=>{
				if ( ! isServerRunning )
				{
					reject( 'Server is not running' );
					return;
				}

				this.find( recordName, options ).then(( model )=>{
					if ( model !== null )
					{
						model.delete( options ).then(()=>{
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
		 * @brief	Searches for a query and removes all the data
		 *
		 * @param	String searchQuery
		 * @param	Object options
		 *
		 * @return	Promise
		 */
		static searchAndRemove( searchQuery, options = {} )
		{
			return new Promise( ( resolve, reject )=>{
				if ( ! isServerRunning )
				{
					reject( 'Server is not running' );
					return;
				}

				this.search( searchQuery, options ).then(( models )=>{
					let promises	= [];

					models.forEach(( model )=>{
						promises.push( model.delete( options ) );
					});

					Promise.all( promises ).then(()=>{
						resolve( false );
					}).catch( reject );
				})
			});
		}

		/**
		 * @brief	Creates a new record and returns a promise that resolve with the new record
		 *
		 * @param	String recordName
		 * @param	Object recordData
		 * @param	Object recordOptions
		 *
		 * @return	Promise
		 */
		static make( recordName = '', recordData = {}, recordOptions = {} )
		{
			let model	= new ModelClass( recordName, recordData, recordOptions );

			return new Promise(( resolve, reject )=>{
				model.save( recordOptions ).then(()=>{
					resolve( model );
				}).catch( reject );
			});
		}
	}

	return ModelClass;
};