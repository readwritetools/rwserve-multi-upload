







<figure>
	<img src='/img/plugins/multi-upload/pexels-2477374.jpg' width='100%' />
	<figcaption></figcaption>
</figure>

# Multi Upload

## Accept multipart/form-data


<address>
<img src='/img/rwtools.png' width=80 /> by <a href='https://readwritetools.com' title='Read Write Tools'>Read Write Tools</a> <time datetime=2020-05-06>May 26, 2020</time></address>



<table>
	<tr><th>Abstract</th></tr>
	<tr><td>This plugin works in conjunction with HTML's <i>FormData</i> object and the corresponding server-side <i>MultipartEntry</i> objects. Together they make it possible for website visitors to upload files to the server.</td></tr>
</table>

### Motivation

Uploading binary files is not possible with typical HTML forms because content
type *x-www-form-urlencoded* only works for text data.

Content type *multipart/form-data* was created to handle binary files.

Properly crafted HTML forms with **enctype=multipart/form-data** and an **input
type=file** element are the solution.

When a POST request is received by the RWSERVE server, multipart data is parsed
and staged to MultipartEntry objects. This staging area is accessible to plugin
developers.

The **rwserve-multi-upload** plugin demonstrates how to use this mechanism to save
uploaded files to the server.

#### Customization

This plugin is open source and can be modified or enhanced to perform tasks such
as these:

   * Saving binary data to a database.
   * Receiving encrypted security credentials and acting upon them.
   * Working with binary data without the need for base64 encoding schemes.

### Download

The plugin module is available from <a href='https://www.npmjs.com/package/rwserve-multi-upload'>NPM</a>
. Before proceeding, you should already have `Node.js` and `RWSERVE` configured and
tested.

This module should be installed on your web server in a well-defined place, so
that it can be discovered by `RWSERVE`. The standard place for public domain
plugins is `/srv/rwserve-plugins`.

<pre>
cd /srv/rwserve-plugins
npm install rwserve-multi-upload
</pre>

### Configuration is Everything

Make the software available by declaring it in the `plugins` section of your
configuration file. For detailed instructions on how to do this, refer to the <a href='https://rwserve.readwritetools.com/plugins.blue'>plugins</a>
documentation on the `Read Write Tools HTTP/2 Server` website.

#### TL;DR

<pre>
server {
    restrictions {
        content-length-limit 10485760     // 10MB
    }
    plugins {
        rwserve-multi-upload {
            location `/srv/rwserve-plugins/node_modules/rwserve-multi-upload/dist/index.js`
            config {
                maxbytes 2097152        // 2MB 
                destination-directory `$DOCUMENTS-PATH/public/uploads/`
            }
        }
        router {
            `/upload-pics`  *methods=POST  *plugin=rwserve-multi-upload
        }    
    }
}    
</pre>

The config settings can be adjusted using this guidance.

`content-length-limit` is a positive integer. This is the maximum size of the
request body that the server will handle. Requests larger than this will be
rejected with status code 413. Keeping this low prevents bad actors from
dropping payload bombs on the server.

`maxbytes` is a positive integer. This is the maximum size of any one file being
uploaded. This value should be less than or equal to the `content-length-limit` value.


`destination-directory` is the where the uploaded files will be saved.

#### Cookbook

A full configuration file with typical settings for a server running on
localhost port 7443, is included in this NPM module at `etc/multi-upload-config`.
To use this configuration file, adjust these variables if they don't match your
server setup:

<pre>
$PLUGIN-PATH='/srv/rwserve-plugins/node_modules/rwserve-multi-upload/dist/index.js'
$PRIVATE-KEY='/etc/pki/tls/private/localhost.key'
$CERTIFICATE='/etc/pki/tls/certs/localhost.crt'
$DOCUMENTS-PATH='/srv/rwserve/configuration-docs'
</pre>

### Usage

#### Server

Start the server using the configuration file just prepared. Use Bash to start
the server in the background, like this:

<pre>
[user@host ~]# rwserve /srv/rwserve-plugins/node_modules/rwserve-multi-upload/etc/multi-upload-config &
</pre>

#### Deployment

Once you've tested the plugin and are ready to go live, adjust your production
web server's configuration in `/etc/rwserve/rwserve.conf` and restart it using `systemd`
. . .

<pre>
[user@host ~]# systemctl restart rwserve
</pre>

. . . then monitor its request/response activity with `journald`.

<pre>
[user@host ~]# journalctl -u rwserve -ef
</pre>

### Prerequisites

This is a plugin for the **Read Write Tools HTTP/2 Server**, which works on Linux
platforms.


<table>
	<tr><th>Software</th> <th>Minimum Version</th> <th>Most Recent Version</th></tr>
	<tr><td>Ubuntu</td> 		<td>16 Xenial Xerus</td> <td>16 Xenial Xerus</td></tr>
	<tr><td>Debian</td> 		<td>9 Stretch</td> 		<td>10 Buster</td></tr>
	<tr><td>openSUSE</td>	<td>openSUSE 15.1</td> 	<td>openSUSE 15.1</td></tr>
	<tr><td>Fedora</td> 		<td>Fedora 27</td> 		<td>Fedora 32</td></tr>
	<tr><td>CentOS</td>		<td>CentOS 7.4</td>		<td>CentOS 8.1</td></tr>
	<tr><td>RHEL</td> 		<td>RHEL 7.8</td>		<td>RHEL 8.2</td></tr>
	<tr><td>RWSERVE</td>		<td>RWSERVE 1.0.1</td>	<td>RWSERVE 1.0.47</td></tr>
	<tr><td>Node.js</td>		<td>Node.js 10.3</td>	<td>Node.js 12.17</td></tr>
</table>

### Review


<table>
	<tr><th>Lessons</th></tr>
	<tr><td>This plugin demonstrates these concepts: <ul><li>Using WorkOrders.</li> <li>Accessing MultipartEntry objects.</li> </ul> Find other plugins for the <code>Read Write Tools HTTP/2 Server</code> using <a href='https://www.npmjs.com/search?q=keywords:rwserve'>npm</a> with these keywords: <kbd>rwserve</kbd>, <kbd>http2</kbd>, <kbd>plugins</kbd>. </td></tr>
</table>

### License

The <span>rwserve-multi-upload</span> plugin is licensed under
the MIT License.

<img src='/img/blue-seal-mit.png' width=80 align=right />

<details>
	<summary>MIT License</summary>
	<p>Copyright © 2020 Read Write Tools.</p>
	<p>Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:</p>
	<p>The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.</p>
	<p>THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.</p>
</details>

### Availability


<table>
	<tr><td>Source code</td> 			<td><a href='https://github.com/readwritetools/rwserve-multi-upload'>github</a></td></tr>
	<tr><td>Package installation</td> <td><a href='https://www.npmjs.com/package/rwserve-multi-upload'>NPM</a></td></tr>
	<tr><td>Documentation</td> 		<td><a href='https://hub.readwritetools.com/plugins/multi-upload.blue'>Read Write Hub</a></td></tr>
</table>

