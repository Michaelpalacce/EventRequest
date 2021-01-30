'use strict';

class TemplatingEngine
{
	constructor()
	{
		this.variablesRe	= /<%([^%>]+)?%>|<\?js(.+?)\/>/gm;
		this.emptyRe		= /([\s]+)/gm;
		this.logicalRe		= /(^( )?(if|else|for|while|switch|case|break|{|}))(.*)?/g;
		this.EOL			= '\n';
	}

	render( template, variables )
	{
		let r$r		= 'const r$r=[];' + this.EOL;
		let cursor	= 0;

		const addCode	= ( line, isJs, insertDirectly = false ) => {
			if ( isJs )
			{
				if ( insertDirectly )
				{
					r$r	+= line + this.EOL;
					return ;
				}

				if ( line.match( this.logicalRe ) )
					r$r	+= line + this.EOL;
				else
				{
					// Escape HTML variables
					line	= line.trim();
					r$r		+= `r$r.push( typeof ${line}==='string'?${line}.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'):${line});${this.EOL}`;
				}
			}
			else
			{
				if ( line.length !== 0 && line.match( this.emptyRe )[0] !== line)
				{
					// Strip line of specific characters
					// Remove ` | Escape $
					r$r	+= `r$r.push(\`` + line.replace( /`/g, '\`' ).replace( '$', '\\$' ) + `\`);` + this.EOL;
				}
			}
		}

		// Add local variables so we don't have to use this. to access variables
		let i	= 0;
		for ( const key in variables )
		{
			r$r	+= `let ${key} = args[${i}];` + this.EOL;
			++i;
		}

		let match;

		while( match	= this.variablesRe.exec( template ) )
		{
			const matchIndex	= match.index;
			const matchedString	= match[0]
			const matchLength	= matchedString.length;

			addCode( template.slice( cursor, matchIndex ) );

			if ( match[1] )
				addCode( match[1], true );

			// Case when <<< >>> syntax is used
			else
				addCode( match[2], true, true );

			cursor	= matchIndex + matchLength;
		}

		addCode( template.substr( cursor, template.length - cursor ) );

		// Finish up
		r$r	+= 'return r$r.join("");';

		return new Function( '...args', r$r ).apply( null, Object.values( variables ) );
	}
}


module.exports	= TemplatingEngine;