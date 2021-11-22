import { RoleDTO, UpdRoleDTO } from './../../dtos/roles.DTO';
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import {RoleModel} from "../models/role.model";
import * as express from 'express';
import Controller from "../../interfaces/controller.interface";
import DataNotFoundException from "../../exceptions/DataNotFoundException";
import NoDataException from "../../exceptions/NoDataExceptions";
import { roles_schema } from "../../schemas/roles.schema";
import validationUpdateMiddleware from "../../middleware/validate.update.dto.middleware";
import validationMiddleware from "../../middleware/validation.middleware";
import PostDataFailedException from "../../exceptions/PostDataFailedException";
import SysEnv from "../../modules/SysEnv";
import { RouteAuthEnum, RouteOtherAuthEnum, RouterService } from '../../services/router.service';



export class RolesController implements Controller{
  public path='/roles';
  public router= express.Router();
  private roles = new RoleModel();
  private routerService = new RouterService();
  siteCode = SysEnv.SITE_CODE;


  constructor() {
      this.siteCode = SysEnv.SITE_CODE;
      this.initializeRoutes();
  }

  public initializeRoutes() {
    this.routerService.putRoute('/api'+this.path, RouteAuthEnum.NORMAL, RouteOtherAuthEnum.NONE).finally(() => {
      this.router.post(this.path,
                      validationMiddleware(roles_schema),
                      this.newRole);
      this.router.get(this.path, this.getAll);
      this.routerService.putRoute('/api'+this.path+'/byId/:id', RouteAuthEnum.NORMAL, RouteOtherAuthEnum.NONE).finally(() => {
        this.router.get(this.path+'/byId/:id',  this.findById);
        this.routerService.putRoute('/api'+this.path+'/:id', RouteAuthEnum.NORMAL, RouteOtherAuthEnum.NONE).finally(() => {
          this.router.patch(this.path+'/:id', validationUpdateMiddleware(roles_schema), this.update);
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
    const dto = new RoleDTO();
    response.send(dto);
  }
  apiUpdDTO  = (request: express.Request, response: express.Response) => {
    const dto = new UpdRoleDTO();
    response.send(dto);
  }
  apiSchema  = (request: express.Request, response: express.Response) => {
    response.send(roles_schema);
  }

  newRole  = (request: express.Request, response: express.Response, next: express.NextFunction) => {
      this.roles.create(request.body).then((respRoleDTO) => {
        if (respRoleDTO) {
            response.send(respRoleDTO);
          } else {
            next(new PostDataFailedException())
          }
      })
  };

  findById  = (request: express.Request, response: express.Response, next: express.NextFunction) => {
    this.roles.findById(request.params.id).then((respRoleDTO) => {
      if (respRoleDTO) {
        response.send(respRoleDTO);
      } else {
        next(new DataNotFoundException(request.params.id))
      }
    })
  }

  getAll  = (request: express.Request, response: express.Response, next: express.NextFunction) => {
    this.roles.getAll().then((respRoleDTOArray) => {
      if (respRoleDTOArray) {
        response.send(respRoleDTOArray);
      } else {
        next(new NoDataException())
      }
    })
  }

  update  = (request: express.Request, response: express.Response, next: express.NextFunction) => {
    this.roles.updateById(request.params.id, request.body).then((respRoleDTO) => {
      if (respRoleDTO) {
        response.send(respRoleDTO);
      } else {
        next(new DataNotFoundException(request.params.id))
      }
    })
  }
}