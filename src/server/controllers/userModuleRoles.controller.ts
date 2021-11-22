import { UserModuleRoleDTO, UpdUserModuleRoleDTO } from './../../dtos/userModuleRoles.DTO';
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import {UserModuleRoleModel} from "../models/userModuleRole.model";
import * as express from 'express';
import Controller from "../../interfaces/controller.interface";
import DataNotFoundException from "../../exceptions/DataNotFoundException";
import NoDataException from "../../exceptions/NoDataExceptions";
import { userModuleRoles_schema } from "../../schemas/userModuleRoles.schema";
import validationUpdateMiddleware from "../../middleware/validate.update.dto.middleware";
import validationMiddleware from "../../middleware/validation.middleware";

import PostDataFailedException from "../../exceptions/PostDataFailedException";
import SysEnv from "../../modules/SysEnv";
import { RouteAuthEnum, RouteOtherAuthEnum, RouterService } from '../../services/router.service';



export class UserModuleRolesController implements Controller{
  public path='/userModuleRoles';
  public router= express.Router();
  private userModuleRoles = new UserModuleRoleModel();
  private routerService = new RouterService();
  siteCode = SysEnv.SITE_CODE;


  constructor() {
      this.siteCode = SysEnv.SITE_CODE;
      this.initializeRoutes();
  }

  public initializeRoutes() {
    this.routerService.putRoute('/api'+this.path, RouteAuthEnum.NORMAL, RouteOtherAuthEnum.NONE).finally(() => {
      this.router.post(this.path,
                      validationMiddleware(userModuleRoles_schema),
                      this.newUserModuleRole);
      this.router.get(this.path, this.getAll);
      this.routerService.putRoute('/api'+this.path+'/byId/:id', RouteAuthEnum.NORMAL, RouteOtherAuthEnum.NONE).finally(() => {
        this.router.get(this.path+'/byId/:id',  this.findById);
        this.routerService.putRoute('/api'+this.path+'/:id', RouteAuthEnum.NORMAL, RouteOtherAuthEnum.NONE).finally(() => {
          this.router.patch(this.path+'/:id', validationUpdateMiddleware(userModuleRoles_schema), this.update);
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
    const dto = new UserModuleRoleDTO();
    response.send(dto);
  }
  apiUpdDTO  = (request: express.Request, response: express.Response) => {
    const dto = new UpdUserModuleRoleDTO();
    response.send(dto);
  }
  apiSchema  = (request: express.Request, response: express.Response) => {
    response.send(userModuleRoles_schema);
  }

  newUserModuleRole  = (request: express.Request, response: express.Response, next: express.NextFunction) => {
      this.userModuleRoles.create(request.body).then((respUserModuleRoleDTO) => {
        if (respUserModuleRoleDTO) {
            response.send(respUserModuleRoleDTO);
          } else {
            next(new PostDataFailedException())
          }
      })
  };

  findById  = (request: express.Request, response: express.Response, next: express.NextFunction) => {
    this.userModuleRoles.findById(request.params.id).then((respUserModuleRoleDTO) => {
      if (respUserModuleRoleDTO) {
        response.send(respUserModuleRoleDTO);
      } else {
        next(new DataNotFoundException(request.params.id))
      }
    })
  }

  getAll  = (request: express.Request, response: express.Response, next: express.NextFunction) => {
    this.userModuleRoles.getAll().then((respUserModuleRoleDTOArray) => {
      if (respUserModuleRoleDTOArray) {
        response.send(respUserModuleRoleDTOArray);
      } else {
        next(new NoDataException())
      }
    })
  }

  update  = (request: express.Request, response: express.Response, next: express.NextFunction) => {
    this.userModuleRoles.updateById(request.params.id, request.body).then((respUserModuleRoleDTO) => {
      if (respUserModuleRoleDTO) {
        response.send(respUserModuleRoleDTO);
      } else {
        next(new DataNotFoundException(request.params.id))
      }
    })
  }

  findByUserId  = (request: express.Request, response: express.Response, next: express.NextFunction) => {
    this.userModuleRoles.getUserModuleRoles(this.siteCode, request.params.userId).then((respUserModuleRoleDTO) => {
      if (respUserModuleRoleDTO) {
        response.send(respUserModuleRoleDTO);
      } else {
        next(new DataNotFoundException(request.params.id))
      }
    })
  }

  
}