'use strict';

// Dependencies
const cluster				= require( 'cluster' );
const Worker				= require( './worker' );
const CommunicationManager	= require( './communication_manager' );

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
		this.server					= server;
		this.workers				= [];
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

			let communicationManager	= this.server.options['communicationManager'];

			let workerCallback			= ( err, data, worker ) =>{
				if ( err && data )
				{
					worker.send( data );
				}
			};

			cluster.on( 'exit', ( worker, code, signal ) =>{
				console.log( `The worker: ${worker.id} died!` );
			});

			cluster.on( 'disconnect', ( worker ) => {
				console.log( `The worker: ${worker.id} disconnected!` );
			});

			cluster.on( 'online', ( worker ) => {
				worker.send( 'start' );
			});

			cluster.on( 'error', ( workerError ) => {
				communicationManager.handleError( workerError, ( err ) => {
					console.log( err );
				});
			});

			cluster.on( 'message', ( worker, message ) => {
				communicationManager.handleMessage( worker, message, ( err, data ) => {
					workerCallback( err, data, worker );
				});
			});
		}
		else
		{
			new Worker( this.server.router, this.server.setUpNewServer.bind( this.server ) );
		}
	}
}

module.exports	= Cluster;