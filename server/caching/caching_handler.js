'use strict';

const DataServer		= require( './data_stores/data_server' );
const MemoryDataServer	= require( './data_stores/memory/memory_data_server' );

class CachingHandler
{
}

module.exports	= {
	CachingHandler,
	DataServer,
	MemoryDataServer
};