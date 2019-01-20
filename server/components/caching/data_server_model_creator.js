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
module.exports	= function ( dataServer, namespace, options = {} )
{
	/**
	 * @brief	Data server model that is attached to a specific namespace and can easily create and save data there.
	 */
	class ModelClass
	{
		constructor( recordName, recordData = {}, recordOptions = {} )
		{
			this.recordName		= recordName;
			this.recordData		= recordData;
			this.recordOptions	= recordOptions;
		}

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