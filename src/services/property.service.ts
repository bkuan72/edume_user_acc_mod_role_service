/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import http from 'http';
import SysEnv from '../modules/SysEnv';

export class PropertyService {
  constructor() {
    return;
  }

  /**
   * Put Property using PROPERTY microservice
   * @returns properties DTO array
   */
  getProperty(
    data: any
  ): Promise<any[]> {
    return new Promise<any[]>((resolve) => {
      const body: Uint8Array[] = [];
      let properties: any[] | PromiseLike<any[]> = [];

      const jsonData = JSON.stringify(data);
      const options: http.RequestOptions = {
        host: SysEnv.PROPERTY_SERVICE + ':' + SysEnv.PROPERTY_SERVICE_PORT,
        hostname: SysEnv.PROPERTY_SERVICE,
        port: SysEnv.PROPERTY_SERVICE_PORT,
        path: '/api/properties/getter',
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      };

      console.info(options);
      const req = http.request(options, (res) => {
        console.log(`statusCode: ${res.statusCode}`);

        res.on('data', (d) => {
          console.info('onData');
          body.push(d);
          const data = Buffer.concat(body).toString();
          properties = JSON.parse(data);
          console.info(data);
        });
        res.on('end', ()=>{
          console.info('onEnd');
          resolve(properties);
        });
      });
      req.on('error', (error) => {
        console.error('onError');
        console.error(error);
        resolve(properties);
      });
    console.info('write:');
      console.info(jsonData);
      req.write(jsonData);
      req.end();
    });
  }

}
