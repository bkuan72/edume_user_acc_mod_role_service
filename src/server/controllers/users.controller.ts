import { InsertUserDTO, ResponseUserDTO, UpdUserDTO } from '../../dtos/user.DTO';
import { CommonFn } from './../../modules/CommonFnModule';
import { AboutDTO } from './../../dtos/about.DTO';
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import {UserModel} from "../models/user.model";
import * as express from 'express';
import Controller from "../../interfaces/controller.interface";
import DataNotFoundException from "../../exceptions/DataNotFoundException";
import NoDataException from "../../exceptions/NoDataExceptions";
import { users_schema } from "../../schemas/users.schema";
import validationUpdateMiddleware from "../../middleware/validate.update.dto.middleware";
import { RouteAuthEnum, RouteOtherAuthEnum, RouterService } from '../../services/router.service';


export class UsersController implements Controller{
  public path='/users';
  public router= express.Router();
  private users = new UserModel();
  private routerService = new RouterService();

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.routerService.putRoute('/api'+this.path, RouteAuthEnum.NORMAL, RouteOtherAuthEnum.NONE).finally(() => {
      this.router.get(this.path, this.getAll);
      this.routerService.putRoute('/api'+this.path+'/basicInfo', RouteAuthEnum.NONE, RouteOtherAuthEnum.NONE).finally(() => {
        this.router.get(this.path+'/basicInfo/byUserId/:userId', this.getBasicUserInfo);
        this.router.get(this.path+'/basicInfo/byKeyword/:keyword', this.getBasicUserInfosByKeyword);
        this.routerService.putRoute('/api'+this.path+'/profile-about/byUserId/:userId', RouteAuthEnum.NORMAL, RouteOtherAuthEnum.NONE).finally(() => {
          this.router.get(this.path+'/profile-about/byUserId/:userId', this.getAbout);
          this.routerService.putRoute('/api'+this.path+'/byUserId/:userId', RouteAuthEnum.NORMAL, RouteOtherAuthEnum.NONE).finally(() => {
            this.router.get(this.path+'/byUserId/:userId', this.findById);
            this.router.patch(this.path+'/byUserId/:userId', validationUpdateMiddleware(users_schema), this.update);
            this.routerService.putRoute('/api'+this.path+'/byEmail/:email', RouteAuthEnum.NORMAL, RouteOtherAuthEnum.NONE).finally(() => {
              this.router.get(this.path+'/byEmail/:email', this.findById);
              this.routerService.putRoute('/api'+this.path+'/updateAvatar/:userId', RouteAuthEnum.NORMAL, RouteOtherAuthEnum.NONE).finally(() => {
                this.router.put(this.path+'/updateAvatar/:userId', this.update);
                this.routerService.putRoute('/api'+this.path+'/DTO', RouteAuthEnum.ADMIN, RouteOtherAuthEnum.NONE).finally(() => {
                  this.router.get(this.path+'/DTO', this.apiDTO);
                  this.routerService.putRoute('/api'+this.path+'/InsDTO', RouteAuthEnum.DEV, RouteOtherAuthEnum.NONE).finally(() => {
                    this.router.get(this.path+'/InsDTO', this.apiInsDTO);
                    this.routerService.putRoute('/api'+this.path+'/schema', RouteAuthEnum.DEV, RouteOtherAuthEnum.NONE).finally(() => {
                      this.router.get(this.path+'/schema', this.apiSchema);
                      this.routerService.putRoute('/api'+this.path+'/updDTO', RouteAuthEnum.NORMAL, RouteOtherAuthEnum.NONE).finally(() => {
                        this.router.get(this.path+'/updDTO', this.apiUpdDTO);
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
    return;
  }

  apiDTO  = (request: express.Request, response: express.Response) => {
    const user = new ResponseUserDTO();
    response.send(user);
  }
  apiInsDTO  = (request: express.Request, response: express.Response) => {
    const dto = new InsertUserDTO();
    response.send(dto);
  }
  apiUpdDTO  = (request: express.Request, response: express.Response) => {
    const dto = new UpdUserDTO();
    response.send(dto);
  }
  apiSchema  = (request: express.Request, response: express.Response) => {
    response.send(users_schema);
  }

  findById  = (request: express.Request, response: express.Response, next: express.NextFunction) => {
    this.users.findById(request.params.userId).then((respUserDTO) => {
      if (respUserDTO) {
        response.send(respUserDTO);
      } else {
        next(new DataNotFoundException(request.params.userId))
      }
    })
  }
  findByEmail  = (request: express.Request, response: express.Response, next: express.NextFunction) => {
    this.users.findByEmail(request.params.email).then((respUserDTO) => {
      if (respUserDTO) {
        response.send(respUserDTO);
      } else {
        next(new DataNotFoundException(request.params.userId))
      }
    })
  }

  getAll  = (request: express.Request, response: express.Response, next: express.NextFunction) => {
    this.users.getAll().then((respUserDTOArray) => {
      if (respUserDTOArray) {
        response.send(respUserDTOArray);
      } else {
        next(new NoDataException())
      }
    })
  }

  update  = (request: express.Request, response: express.Response, next: express.NextFunction) => {
    this.users.updateById(request.params.userId, request.body).then((respUserDTO) => {
      if (respUserDTO) {
        response.send(respUserDTO);
      } else {
        next(new DataNotFoundException(request.params.userId))
      }
    })
  }

  getAbout  = (request: express.Request, response: express.Response, next: express.NextFunction) => {
    this.users.findById(request.params.userId).then((respUserDTO) => {
      if (respUserDTO) {
        const aboutDTO = new AboutDTO();
        aboutDTO.general.gender = respUserDTO?.gender;
        aboutDTO.general.birthday = respUserDTO?.birthday;
        aboutDTO.general.about = respUserDTO?.about_me;
        if (!CommonFn.isEmpty(respUserDTO?.city)) {
          aboutDTO.general.locations.push(respUserDTO?.city);
        }
        if (!CommonFn.isEmpty(respUserDTO?.country)) {
         aboutDTO.general.locations.push(respUserDTO?.country);
        }
        aboutDTO.contact.address = respUserDTO?.address;
        if (!CommonFn.isEmpty(respUserDTO?.phone_no)) {
          aboutDTO.contact.tel.push(respUserDTO?.phone_no);
        }
        if (!CommonFn.isEmpty(respUserDTO?.mobile_no)) {
          aboutDTO.contact.tel.push(respUserDTO?.mobile_no);
        }
        if (!CommonFn.isEmpty(respUserDTO?.website)) {
          aboutDTO.contact.websites.push(respUserDTO?.website);
        }
        if (!CommonFn.isEmpty(respUserDTO?.email)) {
          aboutDTO.contact.emails.push(respUserDTO?.email);
        }
        if (!CommonFn.isEmpty(respUserDTO?.occupation)) {
          aboutDTO.work.occupation =  respUserDTO?.occupation;
        }
        if (!CommonFn.isEmpty(respUserDTO?.skills)) {
          aboutDTO.work.skills =  respUserDTO?.skills;
        }
        if (!CommonFn.isEmpty(respUserDTO?.jobs)) {
          aboutDTO.work.jobs =  respUserDTO?.jobs;
        }

        response.send(aboutDTO);
      } else {
        next(new DataNotFoundException(request.params.userId))
      }
    })
  }

  getBasicUserInfo  = (request: express.Request, response: express.Response, next: express.NextFunction) => {
    this.users.findById(request.params.userId)
    .then((respUserDTO) => {
      if (respUserDTO) {
        response.send({
          id: respUserDTO.id,
          user_name: respUserDTO.user_name,
          first_name: respUserDTO.first_name,
          last_name: respUserDTO.last_name,
          avatar: respUserDTO.avatar,
          allow_promo: respUserDTO.allow_promo,
          allow_friends: respUserDTO.allow_friends,
          allow_notification: respUserDTO.allow_notification,
          allow_msg: respUserDTO.allow_msg,
          allow_follows: respUserDTO.allow_follows,
          public: respUserDTO.public
        });
      } else {
        next(new DataNotFoundException(request.params.userId))
      }
    });
  }

  getBasicUserInfosByKeyword = (request: express.Request, response: express.Response) => {
    this.users.searchUserByKeyword(request.params.keyword)
    .then((respUserDTO) => {
      if (respUserDTO) {
        response.send(respUserDTO);
      } else {
        response.send([]);
      }
    });
  }
}