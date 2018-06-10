'use strict';

// Dependencies
const cluster			= require( 'cluster' );
const Worker			= require( './worker' );
const MessageManager	= require( './message_manager' );

/**
 * @brief	Cluster class used to spawn workers
 */
class Cluster
{
	/**
	 * @param	Server server
	 */
	constructor( server )
	{
		this.server		= server;
		this.workers	= []
	}

	/**
	 * @brief	Starts the cluster and spawns the given amount of workers
	 * @param workers
	 */
	startCluster( workers )
	{
		if ( cluster.isMaster )
		{
			for ( let i = 0; i < workers; ++ i )
			{
				let worker	= cluster.fork();
				this.workers.push( worker );
			}

			cluster.on( 'exit', ( worker, code, signal ) =>{
				console.log( `The worker: ${worker.id} died!` );
			});

			cluster.on( 'disconnect', ( worker ) => {
				console.log( `The worker: ${worker.id} disconnected!` );
			});

			cluster.on( 'online', ( worker ) => {
				console.log( `The worker: ${worker.id} is online!` );
			});

			let messageManager	= new MessageManager();
			cluster.on( 'message', ( worker, message ) =>{
				messageManager.handleMessage( worker, message );
			});
		}
		else
		{
			let worker	= new Worker( this.server.router, this.server.setUpNewServer.bind( this.server ) );
			cluster.worker.on( 'message', ( message )=>{
				worker.masterCommand( message );
			});
		}
	}
}

module.exports	= Cluster;