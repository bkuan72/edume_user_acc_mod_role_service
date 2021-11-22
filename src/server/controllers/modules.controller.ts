import { ModuleDTO, UpdModuleDTO } from './../../dtos/modules.DTO';
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import {ModuleModel} from "../models/module.model";
import * as express from 'express';
import Controller from "../../interfaces/controller.interface";
import DataNotFoundException from "../../exceptions/DataNotFoundException";
import NoDataException from "../../exceptions/NoDataExceptions";
import validationUpdateMiddleware from "../../middleware/validate.update.dto.middleware";
import validationMiddleware from "../../middleware/validation.middleware";
import PostDataFailedException from "../../exceptions/PostDataFailedException";
import SysEnv from "../../modules/SysEnv";
import { RouteAuthEnum, RouteOtherAuthEnum, RouterService } from '../../services/router.service';
import { modules_schema } from '../../schemas/modules.schema';



export class ModulesController implements Controller{
  public path='/modules';
  public router= express.Router();
  private modules = new ModuleModel();
  private routerService = new RouterService();
  siteCode = SysEnv.SITE_CODE;


  constructor() {
      this.siteCode = SysEnv.SITE_CODE;
      this.initializeRoutes();
  }

  public initializeRoutes() {
    this.routerService.putRoute('/api'+this.path, RouteAuthEnum.NORMAL, RouteOtherAuthEnum.NONE).finally(() => {
      this.router.post(this.path,
                      validationMiddleware(modules_schema),
                      this.newModule);
      this.router.get(this.path, this.getAll);
      this.routerService.putRoute('/api'+this.path+'/byId/:id', RouteAuthEnum.NORMAL, RouteOtherAuthEnum.NONE).finally(() => {
        this.router.get(this.path+'/byId/:id',  this.findById);
        this.routerService.putRoute('/api'+this.path+'/:id', RouteAuthEnum.NORMAL, RouteOtherAuthEnum.NONE).finally(() => {
          this.router.patch(this.path+'/:id', validationUpdateMiddleware(modules_schema), this.update);
          this.routerService.putRoute('/api'+this.path+'/DTO', RouteAuthEnum.ADMIN, RouteOtherAuthEnum.NONE).finally(() => {
            this.router.get(this.path+'/DTO', this.apiDTO);
            this.routerService.putRoute('/api'+this.path+'/updDTO', RouteAuthEnum.NORMAL, RouteOtherAuthEnum.NONE).finally(() => {
              this.router.get(this.path+'/updDTO', this.apiUpdDTO);
              this.routerService.putRoute('/api'+this.path+'/schema', RouteAuthEnum.ADMIN, RouteOtherAuthEnum.NONE).finally(() => {
                this.router.get(this.path+'/schema', this.apiSchema);
              });
            });
          });
        });
      });
    });





    return;
  }

  apiDTO  = (request: express.Request, response: express.Response) => {
    const dto = new ModuleDTO();
    response.send(dto);
  }
  apiUpdDTO  = (request: express.Request, response: express.Response) => {
    const dto = new UpdModuleDTO();
    response.send(dto);
  }
  apiSchema  = (request: express.Request, response: express.Response) => {
    response.send(modules_schema);
  }

  newModule  = (request: express.Request, response: express.Response, next: express.NextFunction) => {
      this.modules.create(request.body).then((respModuleDTO) => {
        if (respModuleDTO) {
            response.send(respModuleDTO);
          } else {
            next(new PostDataFailedException())
          }
      })
  };

  findById  = (request: express.Request, response: express.Response, next: express.NextFunction) => {
    this.modules.findById(request.params.id).then((respModuleDTO) => {
      if (respModuleDTO) {
        response.send(respModuleDTO);
      } else {
        next(new DataNotFoundException(request.params.id))
      }
    })
  }

  getAll  = (request: express.Request, response: express.Response, next: express.NextFunction) => {
    this.modules.getAll().then((respModuleDTOArray) => {
      if (respModuleDTOArray) {
        response.send(respModuleDTOArray);
      } else {
        next(new NoDataException())
      }
    })
  }

  update  = (request: express.Request, response: express.Response, next: express.NextFunction) => {
    this.modules.updateById(request.params.id, request.body).then((respModuleDTO) => {
      if (respModuleDTO) {
        response.send(respModuleDTO);
      } else {
        next(new DataNotFoundException(request.params.id))
      }
    })
  }
}