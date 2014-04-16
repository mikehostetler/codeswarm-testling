# CodeSwarm Testling plugin

This plugin extends CodeSwarm to facilitate cross-browser testing.  It requires [CodeSwarm](http://codeswarm.com) to run.

## Instructions

Before you run any test you first need to upload your public key to testling.
To do that you can:

```bash
$ curl -u <my testling username> -sST <my testling pub key> https://testling.com/tunnel
```

(It is recommended that you create a specific ssh key just for testling)


## Development environment

Requisites:

### codeswarm-gateway

Have codeswarm-gateway globally installed. For now you can do it like this:

```
$ git clone git@github.com:codeswarm/codeswarm-gateway.git
$ cd codeswarm-gateway
$ npm link
```

### php-cgi

If you're running php tests you must have php-cgi executable installed.

In Mac with Homebrew you can install it like this:

```bash
$ brew tap homebrew/dupes
$ brew tap josegonzalez/homebrew-php
$ brew install php54
```

## License Information

This project has been released under the [Apache License, version 2.0](http://www.apache.org/licenses/LICENSE-2.0.html), the text of which is included below. This license applies ONLY to the source of this repository and does not extend to any other CodeSwarm distribution or variant, or any other 3rd party libraries used in a repository. 

> Copyright © 2014 CodeSwarm, Inc.

> Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

> [http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)

>  Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
