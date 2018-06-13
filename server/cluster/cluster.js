'use strict';

// Dependencies
const cluster	= require( 'cluster' );
const Worker	= require( './worker' );

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
		this.communicationManager	= this.server.options['communicationManager']
	}

	/**
	 * @brief	Starts the cluster and spawns the given amount of workers
	 * @param workers
	 */
	startCluster( workers )
	{
		if ( cluster.isMaster )
		{
			let spawnedWorkers	= [];
			for ( let i = 0; i < workers; ++ i )
			{
				let worker	= cluster.fork();
				spawnedWorkers.push( worker );
			}

			this.communicationManager.attachListeners( spawnedWorkers );
		}
		else
		{
			new Worker( this.server.router, this.server.setUpNewServer.bind( this.server ) );
		}
	}
}

module.exports	= Cluster;