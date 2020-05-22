//=============================================================================
//
// File:         rwserve-multi-upload/src/index.js
// Language:     ECMAScript 2015
// Copyright:    Read Write Tools © 2020
// License:      MIT License
// Initial date: May 21, 2020
//
// Contents:     An RWSERVE plugin to accept multipart/form-data containing
//               binary image files
//
//               HTTP POST request sent to the URL /upload-pics are examined
//               by this plugin.
//               If the content-type is "multipart/form-data" the files contained
//               in the request body are written to the web server's /upload-area
//               Each multipart section should begin with a header like:
//
//               content-disposition: form-data; name="uploadFile"; filename="image.jpg"
//
//======================== Sample configuration ===============================
/*
	plugins {
		rwserve-multi-upload {
			location `/srv/rwserve-plugins/node_modules/rwserve-multi-upload/dist/index.js`
			config {
				upload-area `$DOCUMENTS-PATH/public/upload-area`
				maxbytes 10737418240		// 10 Mb
			}
		}
		router {
			`/upload-pics`  *methods=POST  *plugin=rwserve-multi-upload
		}	
	}
*/
//=============================================================================

import {log} 		from 'rwserve-plugin-sdk';
import {SC} 		from 'rwserve-plugin-sdk';
import fs			from 'fs';
import path			from 'path';

export default class RwserveMultiUpload {

	constructor(hostConfig) {
		this.hostConfig = hostConfig;
		this.uploadArea = hostConfig.pluginsConfig.rwserveMultiUpload['upload-area'];
		this.maxbytes = hostConfig.pluginsConfig.rwserveMultiUpload['maxbytes'];
    	Object.seal(this);
	}
	
	async startup() {
		log.debug('RwserveMultiUpload', `version ${this.hostConfig.pluginsConfig.multiUpload.pluginVersion}; © 2020 Read Write Tools; MIT License`); 

		if (!fs.existsSync(this.uploadArea)) {
			fs.mkdirSync(this.uploadArea);
			log.debug(`Upload directory created: ${this.uploadArea}`);
		}
	}
	
	async shutdown() {
		log.debug('RwserveMultiUpload', `Shutting down ${this.hostConfig.hostname}`); 
	}
	
	//^ Processing sequence for handling this plugin
	async processingSequence(workOrder) {

		// This plugin is only meaningful for POST
		if (workOrder.getMethod() != 'POST')
			return;
		
		try {
			if (workOrder.requestHeaders.getContentType().indexOf('multipart/form-data') == -1)
				return;

			// the sections of the multipart form are already parsed by the server into MultipartEntry objects
			for (let i=0; i < workOrder._multipartFormData.length; i++) {
				var multipartEntry = workOrder._multipartFormData[i];
				
				if (!fs.existsSync(this.uploadArea)) {
					workOrder.addXHeader('rw-upload-area-missing', '', '', SC.INTERNAL_SERVER_ERROR_500);
					workOrder.noFurtherProcessing();
					return;
				}
				if (!fs.statSync(this.uploadArea).isDirectory()) {
					workOrder.addXHeader('rw-upload-area-not-directory', '', '', SC.INTERNAL_SERVER_ERROR_500);
					workOrder.noFurtherProcessing();
					return;
				}
						
				// no provision has been made to deal with missing or blank filenames 
				if (multipartEntry.filename == '') {
					multipartEntry.httpStatus = SC.BAD_REQUEST_400;
					continue;
				}
				
				// an empty file is not really an error, but it's a choice this plugin makes to not create empty files
				if (multipartEntry.lengthOfData == 0) {
					multipartEntry.httpStatus = SC.BAD_REQUEST_400;
					continue;
				}

				// filesize is limited to the plugin's 'maxbytes' configuration value
				if (multipartEntry.lengthOfData > this.maxbytes) {
					workOrder.addXHeader('rw-filesize-too-large', this.maxbytes, multipartEntry.lengthOfData, SC.PAYLOAD_TOO_LARGE_413);
					continue;
				}
				
				// reverse-solidus, solidus, colon, asterisk, question-mark, less-than, greater-than, vertical-bar, x000 - 0x1F, 0x7F 
				var sanitizedFilename = multipartEntry.filename.replace( /[\\/:\*\?"<>\|\x01-\x1F\x7F]/g, '-');
				multipartEntry.filename = sanitizedFilename;
				var fullFilename = `${this.uploadArea}${sanitizedFilename}`;
				var previouslyExists = fs.existsSync(fullFilename);
				
				fs.writeFileSync(fullFilename, multipartEntry.dataBytes);				
				var nowExists = fs.existsSync(fullFilename);
				
				if (nowExists == false) {
					workOrder.addXHeader('rw-file-not-written', sanitizedFilename, '', SC.INTERNAL_SERVER_ERROR_500);
					multipartEntry.httpStatus = SC.INTERNAL_SERVER_ERROR_500;
					continue;
				}
				else if (previouslyExists == false) {
					multipartEntry.httpStatus = SC.CREATED_201;
					continue;
				}
				else if (previouslyExists == true) {
					multipartEntry.httpStatus = SC.NO_CONTENT_204;
					continue;
				}
			}

			// build the response payload, which is a JSON object with the status of each file
			var arr = [];
			for (let i=0; i < workOrder._multipartFormData.length; i++) {
				var multipartEntry = workOrder._multipartFormData[i];
				var obj = {
					name: multipartEntry.name,
					filename: multipartEntry.filename,
					httpStatus: multipartEntry.httpStatus
				};
				arr.push(obj);
			}
			var json = JSON.stringify(arr);
			workOrder.setResponseBody(json);
			workOrder.addStdHeader('content-type', 'application/json');
			workOrder.addStdHeader('content-length', json.length);
			workOrder.setStatusCode(SC.MULTI_STATUS_207);
		}
		catch (err) {
			// send the error message to the journald log
			log.error(err.message);
		}
	}
}
