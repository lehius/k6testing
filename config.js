const config = {
  network: {
    host: '192.168.0.72',
    port: 55556,
    path: 'logic'
  }
};
export const url = `ws://${config.network.host}:${config.network.port}/${config.network.path}`;
