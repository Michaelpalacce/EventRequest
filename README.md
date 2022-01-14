# EventRequest
A highly customizable backend server in NodeJs. Any feedback is most welcome!

[![linux-12.x](https://github.com/Michaelpalacce/EventRequest/workflows/linux-12.x/badge.svg)](https://github.com/Michaelpalacce/EventRequest/actions?query=workflow%3Alinux-12.x)
[![linux-14.x](https://github.com/Michaelpalacce/EventRequest/workflows/linux-14.x/badge.svg)](https://github.com/Michaelpalacce/EventRequest/actions?query=workflow%3Alinux-14.x)
[![linux-15.x](https://github.com/Michaelpalacce/EventRequest/workflows/linux-15.x/badge.svg)](https://github.com/Michaelpalacce/EventRequest/actions?query=workflow%3Alinux-15.x)
[![linux-16.x](https://github.com/Michaelpalacce/EventRequest/actions/workflows/linux.16x.ci.yml/badge.svg)](https://github.com/Michaelpalacce/EventRequest/actions/workflows/linux.16x.ci.yml)
[![linux-17.x](https://github.com/Michaelpalacce/EventRequest/actions/workflows/linux.17x.ci.yml/badge.svg)](https://github.com/Michaelpalacce/EventRequest/actions/workflows/linux.17x.ci.yml)

[![windows-12.x](https://github.com/Michaelpalacce/EventRequest/workflows/windows-12.x/badge.svg)](https://github.com/Michaelpalacce/EventRequest/actions?query=workflow%3Awindows-12.x)
[![windows-14.x](https://github.com/Michaelpalacce/EventRequest/workflows/windows-14.x/badge.svg)](https://github.com/Michaelpalacce/EventRequest/actions?query=workflow%3Awindows-14.x)
[![windows-15.x](https://github.com/Michaelpalacce/EventRequest/workflows/windows-15.x/badge.svg)](https://github.com/Michaelpalacce/EventRequest/actions?query=workflow%3Awindows-15.x)
[![windows-16.x](https://github.com/Michaelpalacce/EventRequest/actions/workflows/windows.16x.ci.yml/badge.svg)](https://github.com/Michaelpalacce/EventRequest/actions/workflows/windows.16x.ci.yml)
[![windows-17.x](https://github.com/Michaelpalacce/EventRequest/actions/workflows/windows.17x.ci.yml/badge.svg)](https://github.com/Michaelpalacce/EventRequest/actions/workflows/windows.17x.ci.yml)

[![Codacy Badge](https://app.codacy.com/project/badge/Coverage/3c843dd2bc454f06b10eb60820dc6d1b)](https://www.codacy.com/manual/Michaelpalacce/EventRequest?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=Michaelpalacce/EventRequest&amp;utm_campaign=Badge_Coverage)

[![CodeFactor](https://www.codefactor.io/repository/github/michaelpalacce/eventrequest/badge)](https://www.codefactor.io/repository/github/michaelpalacce/eventrequest)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/3c843dd2bc454f06b10eb60820dc6d1b)](https://www.codacy.com/manual/Michaelpalacce/EventRequest?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=Michaelpalacce/EventRequest&amp;utm_campaign=Badge_Grade) 
[![DeepScan grade](https://deepscan.io/api/teams/10419/projects/13164/branches/218269/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=10419&pid=13164&bid=218269)

[![GitHub last commit](https://img.shields.io/github/last-commit/Michaelpalacce/EventRequest)](https://github.com/Michaelpalacce/EventRequest)
[![GitHub last commit (branch)](https://img.shields.io/github/last-commit/MichaelPalacce/EventRequest/develop?label=last%20commit%20develop)](https://github.com/Michaelpalacce/EventRequest)
[![GitHub issues](https://img.shields.io/github/issues-raw/Michaelpalacce/EventRequest)](https://github.com/Michaelpalacce/EventRequest)
[![Maintenance](https://img.shields.io/maintenance/yes/2022)](https://github.com/Michaelpalacce/EventRequest)
[![Known Vulnerabilities](https://snyk.io/test/github/Michaelpalacce/EventRequest/badge.svg?targetFile=package.json)](https://snyk.io/test/github/Michaelpalacce/EventRequest?targetFile=package.json)
[![npm version](https://badge.fury.io/js/event_request.svg)](https://www.npmjs.com/package/event_request)
[![npm](https://img.shields.io/npm/dt/event_request)](https://www.npmjs.com/package/event_request)
[![npm](https://img.shields.io/npm/dw/event_request)](https://www.npmjs.com/package/event_request)
[![npm bundle size](https://img.shields.io/bundlephobia/min/event_request)](https://www.npmjs.com/package/event_request)

[**CHANGELOG**](https://github.com/Michaelpalacce/EventRequest/blob/master/UPDATELOG.md) || [**BENCHMARKS**](https://github.com/Michaelpalacce/EventRequest-Benchmarks)

# Documentation:
Check out the docs section or go to: [Documentation](https://github.com/Michaelpalacce/EventRequest/tree/master/docs).
Links and structure will be added here soon

# [Setup](#setup)

~~~javascript
// Framework Singleton instance
const app = require( 'event_request' )();

// Add a new Route
app.get( '/', ( event ) => {
 event.send( '<h1>Hello World!</h1>' );
});

// Start Listening
app.listen( 80, () => {
 app.Loggur.log( 'Server started' );
});
~~~


# [External Plug-ins](#external-plugins):
- https://www.npmjs.com/package/er_memcached_data_server - memcached data server [![Build Status](https://travis-ci.com/Michaelpalacce/er_memcached_data_server.svg?branch=master)](https://travis-ci.com/Michaelpalacce/er_memcached_data_server)
- https://www.npmjs.com/package/er_redis_data_server - redis data server [![Build Status](https://travis-ci.com/Michaelpalacce/er_redis_data_server.svg?branch=master)](https://travis-ci.com/Michaelpalacce/er_redis_data_server)

# [Example Projects:](#example-projects)
- https://github.com/Michaelpalacce/Server - A Web App that emulates a File System on your browser and can be used to upload/download/delete files, images, audio and etc as well as stream videos directly from your browser
- https://github.com/Michaelpalacce/personal-website-vue - My website written with the framework.
- 
