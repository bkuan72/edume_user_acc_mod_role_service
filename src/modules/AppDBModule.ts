import Session from 'mysqlx/lib/Session';
import {
  ServerDefaultProperties,
  ServerPropertyTypeEnum
} from '../config/server.default.properties';
import SysEnv from './SysEnv';
import dbConnection from './DbModule';
import { PropertyService } from '../services/property.service';

export class AppDbModule {
  dbConnection = dbConnection;
  properties = new PropertyService();
  propertiesRetry = true;


  public connectDB(): Promise<Session> {
    return new Promise((resolve) => {
      this.dbConnection.DBM_connectDB().then((connection) => {
        if (this.propertiesRetry) {
          this.createDefaultProperties().finally(() => {
            this.propertiesRetry = false;
            resolve(connection);
          });
        } else {
          resolve(connection);
        }
      });
    });
  }

  private createDefaultProperties(): Promise<void> {
    return new Promise<void>((resolve) => {
      const createProperty = (
        res: (value: void | PromiseLike<void>) => void,
        idx: number
      ): void => {
        if (this.propertiesRetry === false) {
          res();
          return;
        }
        if (idx >= ServerDefaultProperties.length) {
          this.propertiesRetry = false;
          res();
        } else {
          const prop = ServerDefaultProperties[idx];
          const propName = SysEnv.SITE_CODE + '.' + prop.name;
          const newProperty = {
            name: '',
            property_type: '',
            value: '',
            numValue: 0
          };
          newProperty.name = propName;
          switch (prop.type) {
            case ServerPropertyTypeEnum.INT:
              if (prop.numValue) {
                newProperty.numValue = prop.numValue;
              }
              newProperty.property_type = 'INT';
              break;
            case ServerPropertyTypeEnum.TEXT:
              if (prop.value) {
                newProperty.value = prop.value;
              }
              newProperty.property_type = 'TEXT';
              break;
          }
          this.properties
            .getProperty(newProperty)
            .then((propertyDTO) => {
              if (propertyDTO.length > 0) {
                ServerDefaultProperties[idx].numValue = propertyDTO[0].numValue;
                ServerDefaultProperties[idx].value = propertyDTO[0].value;
              }
              createProperty(res, idx + 1);
            })
            .catch(() => {
              this.propertiesRetry = true;
              res();
            });
        }
      };
      createProperty(resolve, 0);
    });
  }
}

const appDbConnection = new AppDbModule();

export default appDbConnection;
