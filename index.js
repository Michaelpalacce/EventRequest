'use strict';

// Dependencies
const PluginInterface			= require( './server/plugins/plugin_interface' );
const Logging					= require( './server/components/logger/loggur' );
const DataServer				= require( './server/components/caching/data_server' );
const LeakyBucket				= require( './server/components/rate_limiter/bucket' );
const Testing					= require( './server/tester/tester' );
const Server					= require( './server/server' );
const FileStream				= require( './server/components/file_streams/file_stream' );
const { Loggur, LOG_LEVELS }	= Logging;

// Holds tools for third party tools
const Development	= {
	PluginInterface, DataServer, FileStream, Testing, LeakyBucket
};

module.exports		= {
	Server,		Development,
	LOG_LEVELS,	Loggur,
	Logging
};
