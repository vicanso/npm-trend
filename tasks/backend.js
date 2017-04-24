const fs = require('fs');
const _ = require('lodash');
const EtcdRegister = require('etcd-register');
const stringify = require('simple-stringify');

const config = localRequire('config');

/**
 * 获取本机IP地址
 * @return {[type]} [description]
 */
const getIPAddress = () => {
  if (config.IP) {
    return config.IP;
  }
  const hostname = process.env.HOSTNAME;
  if (!hostname) {
    return '127.0.0.1';
  }
  const hosts = fs.readFileSync('/etc/hosts', 'utf8');
  // etc hosts中的ip都是正常的，因此正则的匹配考虑的简单一些
  const reg = new RegExp(`((?:[0-9]{1,3}.){3}[0-9]{1,3})\\s*${hostname}`);
  return _.get(reg.exec(hosts), 1);
};

const refresh = (client, interval) => {
  client.refresh().then(() => {
    console.info('refresh backend etcd config success');
    setTimeout(() => {
      refresh(client, interval);
    }, interval).unref();
  }).catch((err) => {
    console.error('refresh backend etcd config fail, %s', err);
    setTimeout(() => {
      refresh(client, interval);
    }, 10 * 1000).unref();
  });
};

module.exports = (interval) => {
  if (!config.etcd) {
    return;
  }
  const client = new EtcdRegister(config.etcd, {
    key: 'backend',
  });
  const data = {
    port: config.port,
    ip: getIPAddress(),
    name: config.app,
  };
  if (config.appUrlPrefix) {
    data.prefix = config.appUrlPrefix;
  }
  if (config.domain) {
    data.host = config.domain;
  }
  client.set(data);
  client.addTag('backend:http', `app:${config.app}`, 'ping:http');
  client.ttl(600);
  console.info(`register backend to etcd, config:${stringify.json(data)}`);
  client.register().then((res) => {
    console.info('register backend etcd config success');
    setTimeout(() => {
      refresh(client, interval);
    }, interval).unref();
  }).catch(err => console.error('register backend etcd config fail, %s', err));
};
