#!/usr/bin/env node
const path	= require( 'path' );

const projectDir	= path.resolve( __dirname, './generator' );
const clientDir		= process.cwd();

console.log( projectDir );
console.log( clientDir );