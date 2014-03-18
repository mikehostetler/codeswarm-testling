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