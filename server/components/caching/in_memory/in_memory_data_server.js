'use strict';

const { DataServer, SERVER_STATES }	= require( './../data_server' );

/**
 * @brief	InMemoryDataServer that stores data in the process.dataServer variable
 */
class InMemoryDataServer extends DataServer
{
	constructor( options = {} )
	{
		super( options );

		this.memoryLimit	= 0;
	}

	/**
	 * @copydoc	DataServer::sanitize
	 */
	sanitize( options )
	{
	}

	/**
	 * @copydoc	DataServer::setUp
	 */
	setUp( options = {} )
	{
		this.changeServerState( SERVER_STATES.starting );
		return new Promise( ( resolve, reject )=>{
			if ( typeof process.dataServer === 'undefined' )
			{
				process.dataServer			= {};
				process.dataServer.data		= {};
				process.dataServer.timeouts	= {};
			}

			this.changeServerState( SERVER_STATES.running );
			resolve( false );
		});
	}

	/**
	 * @copydoc	DataServer::createNamespace
	 */
	createNamespace( namespace, options = {} )
	{
		return new Promise( ( resolve, reject ) =>{
			if ( this.getServerState() !== SERVER_STATES.running )
			{
				reject( 'Server not set up' );
				return;
			}

			this.existsNamespace( namespace, options ).then( ( exists )=>{
				if ( ! exists )
				{
					process.dataServer.data[namespace]	= {};

					resolve( false );
				}
				else
				{
					reject( 'Namespace already exists' );
				}
			} ).catch( reject );
		})
	}

	/**
	 * @copydoc	DataServer::createNamespace
	 */
	existsNamespace( namespace, options = {} )
	{
		return new Promise( ( resolve, reject )=>{
			if ( this.getServerState() !== SERVER_STATES.running )
			{
				reject( 'Server not set up' );
				return;
			}

			resolve( typeof process.dataServer.data[namespace] !== 'undefined' );
		});
	}

	/**
	 * @copydoc	DataServer::removeNamespace
	 */
	removeNamespace( namespace, options = {} )
	{
		return new Promise( ( resolve, reject )=>{
			if ( this.getServerState() !== SERVER_STATES.running )
			{
				reject( 'Server not set up' );
				return;
			}

			this.existsNamespace( namespace, options ).then( ( exists )=>{
				if ( ! exists )
				{
					reject( 'Namespace does not exists' );
				}
				else
				{
					delete process.dataServer.data[namespace];

					resolve( false );
				}
			} ).catch( reject );
		});
	}

	/**
	 * @copydoc	DataServer::create
	 */
	create( namespace, recordName, data = {}, options = {} )
	{
		return new Promise( ( resolve, reject ) => {
			if ( this.getServerState() !== SERVER_STATES.running )
			{
				reject( 'Server not set up' );
				return;
			}

			this.existsNamespace( namespace ).then( ( exists )=>{
				if ( ! exists )
				{
					reject( 'Namespace does not exist' );
					return;
				}

				this.clearTimeoutFromData( namespace, recordName );

				process.dataServer.data[namespace][recordName]	= data;
				this.addTimeoutToData( namespace, recordName, this.getTTL( options ) );

				resolve( false );
			}).catch( reject );
		})
	}

	/**
	 * @brief	Clears up the timeout from the data
	 *
	 * @param	String namespace
	 * @param	String recordName
	 *
	 * @return	void
	 */
	clearTimeoutFromData( namespace, recordName )
	{
		let keyPair	= namespace + '||' + recordName;

		clearTimeout( process.dataServer.timeouts[keyPair] );
		delete process.dataServer.timeouts[keyPair];
	}

	/**
	 * @brief	Adds a timeout to the given data
	 *
	 * @param	String namespace
	 * @param	String recordName
	 * @param	Number ttl
	 *
	 * @return	void
	 */
	addTimeoutToData( namespace, recordName, ttl )
	{
		this.clearTimeoutFromData( namespace, recordName );

		let keyPair	= namespace + '||' + recordName;
		process.dataServer.timeouts[keyPair]	= setTimeout( () => {
			if ( typeof process.dataServer.data[namespace] !== 'undefined' )
			{
				delete process.dataServer.data[namespace][recordName];
			}

			delete process.dataServer.timeouts[keyPair];
		}, ttl );
	}

	/**
	 * @brief	Extracts the ttl from the options
	 *
	 * @param	object options
	 *
	 * @return	Number
	 */
	getTTL( options )
	{
		return ( typeof options === 'object' && typeof options.ttl === 'number' && options.ttl > 0 )
			? options.ttl
			: 24 * 60 * 60 * 1000;
	}
}

module.exports	= InMemoryDataServer;