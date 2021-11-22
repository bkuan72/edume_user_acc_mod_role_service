/* eslint-disable @typescript-eslint/no-explicit-any */
import Controller from '../../interfaces/controller.interface';
import * as express from 'express';
import { RoleModel } from '../models/role.model';
import { ModuleDTO } from '../../dtos/modules.DTO';
import { ModuleData } from '../../schemas/modules.schema';
import { RoleDTO } from '../../dtos/roles.DTO';
import SysEnv from '../../modules/SysEnv';
import { RoleData } from '../../schemas/roles.schema';
import { ModuleModel } from '../models/module.model';
import { AccountModel } from '../models/account.model';
import { AccountDTO } from '../../dtos/accounts.DTO';
import { AccountData } from '../../schemas/accounts.schema';
import UserModel from '../models/user.model';
import { ResponseUserDTO } from '../../dtos/user.DTO';
import { UserData } from '../../schemas/users.schema';
import { serverCfg } from '../../config/db.config';
import { UserModuleRoleModel } from '../models/userModuleRole.model';
import { UserModuleRoleDTO } from '../../dtos/userModuleRoles.DTO';
import { UserModuleRoleData } from '../../schemas/userModuleRoles.schema';
import UserAccountModel from '../models/userAccount.model';
import { UserAccountsDTO } from '../../dtos/userAccounts.DTO';
import { UserAccountsData } from '../../schemas/userAccounts.schema';

export class UserAccModuleRoleController implements Controller {
  public path = '/SysCheckUserAccountModuleRole';
  public router = express.Router();
  siteCode: string;

  constructor() {
    this.siteCode = SysEnv.SITE_CODE;
    this.initializeRoutes();
  }

  public initializeRoutes(): void {
    this.router.get(this.path, this.apiCheckCreateUserAccModRoles);
  }
  
  apiCheckCreateUserAccModRoles  = (request: express.Request, response: express.Response) => {
    const userAccModRole = this.createDefaultUserRoleAccounts ();
    response.send(userAccModRole);
  }

  private async createDefaultUserRoleAccounts() {
    const roles = new RoleModel();
    const { devRole, adminRole }: { devRole: any; adminRole: any } =
      await this.createDefaultRoles(roles);

    const allModule: ModuleDTO | ModuleData | undefined =
      await this.createDefaultModules();

    const {
      devUser,
      adminUser,
      adminAccount,
      devAccount
    }: { devUser: any; adminUser: any; adminAccount: any; devAccount: any } =
      await this.createDefaultAccounts();

    await this.createDefaultUserModuleRoles(
      allModule,
      devUser,
      devRole,
      adminUser,
      adminRole
    );

    await this.createDefaultUserAccounts(
      adminAccount,
      adminUser,
      devUser,
      devAccount
    );
    return { adminAccount, adminUser, devUser, devAccount };
  }

  private async createDefaultRoles(roles: RoleModel) {
    const roleArray = await roles.find({
      site_code: SysEnv.SITE_CODE
    });
    let devRole: RoleDTO | RoleData | undefined;
    let adminRole: RoleDTO | RoleData | undefined;
    let stdRole: RoleDTO | RoleData | undefined;
    if (roleArray) {
      roleArray.forEach((role) => {
        if (role.role_code === 'ADMIN') {
          adminRole = role;
        } else {
          if (role.role_code === 'DEV') {
            devRole = role;
          } else {
            if (role.role_code === 'STANDARD') {
              stdRole = role;
            }
          }
        }
      });
    }

    if (devRole == undefined) {
      devRole = await roles.create({
        role_code: 'DEV',
        description: 'Developer Role',
        add_ok: true,
        edit_ok: true,
        delete_ok: true,
        configure_ok: true,
        dev_ok: true,
        status: 'OK'
      });
    }
    if (adminRole == undefined) {
      adminRole = await roles.create({
        role_code: 'ADMIN',
        description: 'Website Admin Role',
        add_ok: true,
        edit_ok: true,
        delete_ok: true,
        configure_ok: true,
        dev_ok: false,
        status: 'OK'
      });
    }
    if (stdRole == undefined) {
      stdRole = await roles.create({
        role_code: 'STANDARD',
        description: 'Standard User Role',
        add_ok: true,
        edit_ok: true,
        delete_ok: true,
        configure_ok: false,
        dev_ok: false,
        status: 'OK'
      });
    }
    return { devRole, adminRole };
  }

  private async createDefaultModules() {
    const module = new ModuleModel();
    const moduleArray = await module.find({
      site_code: SysEnv.SITE_CODE
    });
    let allModule: ModuleDTO | ModuleData | undefined;
    if (moduleArray) {
      moduleArray.forEach((module) => {
        if (module.module_code == 'ALL') {
          allModule = module;
        }
      });
    }
    if (allModule == undefined) {
      allModule = await module.create({
        module_code: 'ALL',
        description: 'All Modules',
        status: 'OK'
      });
    }
    return allModule;
  }

  private async createDefaultAccounts() {
    const accounts = new AccountModel();
    const accountArray = await accounts.find({
      site_code: SysEnv.SITE_CODE
    });
    let devAccount: AccountDTO | AccountData | undefined;
    let adminAccount: AccountDTO | AccountData | undefined;
    if (accountArray) {
      accountArray.forEach((account) => {
        if (account.account_type == 'ADMIN') {
          adminAccount = account;
        } else {
          if (account.account_type == 'DEV') {
            devAccount = account;
          }
        }
      });
    }
    if (devAccount == undefined) {
      devAccount = await accounts.createDevAccount({
        account_code: 'DEV_ACCOUNT',
        account_name: 'Developer Account',
        description: 'Dev Account',
        website: '',
        status: 'APPROVED'
      });
    }
    if (adminAccount == undefined) {
      adminAccount = await accounts.createAdminAccount({
        account_code: 'ADMIN_ACCOUNT',
        account_name: 'Website Admin Account',
        description: 'Admin Account',
        website: '',
        status: 'APPROVED'
      });
    }

    const {
      devUser,
      adminUser
    }: {
      devUser: any;
      adminUser: any;
    } = await this.createDefaultUsers();
    return { devUser, adminUser, adminAccount, devAccount };
  }

  private async createDefaultUsers() {
    const users = new UserModel();
    let adminUser: ResponseUserDTO | UserData | undefined;
    let devUser: ResponseUserDTO | UserData | undefined;
    const userArray = await users.find({
      site_code: SysEnv.SITE_CODE
    });
    if (userArray) {
      userArray.forEach((user) => {
        if (user.email == serverCfg.defaultAdminEmail) {
          adminUser = user;
        } else;
        {
          if (user.email == serverCfg.defaultDevEmail) {
            devUser = user;
          }
        }
      });
    }

    if (adminUser === undefined) {
      adminUser = await users.create({
        user_id: serverCfg.defaultAdminUserId,
        email: serverCfg.defaultAdminEmail,
        title: 'N/A',
        first_name: serverCfg.defaultAdminUserName,
        user_name: serverCfg.defaultAdminUserName,
        password: serverCfg.defaultAdminPassword,
        phone_no: serverCfg.defaultAdminPhoneNo,
        mobile_no: serverCfg.defaultAdminPhoneNo,
        website: '',
        language: 'EN',
        status: 'ENABLED'
      });
    }

    if (devUser === undefined) {
      devUser = await users.create({
        user_id: serverCfg.defaultDevUserId,
        email: serverCfg.defaultDevEmail,
        title: 'N/A',
        first_name: serverCfg.defaultAdminUserName,
        user_name: serverCfg.defaultDevUserName,
        password: serverCfg.defaultDevPassword,
        phone_no: serverCfg.defaultDevPhoneNo,
        mobile_no: serverCfg.defaultDevPhoneNo,
        website: '',
        language: 'EN',
        status: 'ENABLED'
      });
    }
    return { devUser, adminUser };
  }

  private async createDefaultUserModuleRoles(
    allModule: any,
    devUser: any,
    devRole: any,
    adminUser: any,
    adminRole: any
  ) {
    const userModuleRole = new UserModuleRoleModel();
    const devUserStdModuleRoleArray = await userModuleRole.find({
      site_code: SysEnv.SITE_CODE,
      module_id: allModule.id,
      user_id: devUser.id,
      role_id: devRole.id
    });
    let devUserStdModuleRole:
      | UserModuleRoleDTO
      | UserModuleRoleData
      | undefined;
    if (devUserStdModuleRoleArray && devUserStdModuleRoleArray.length > 0) {
      devUserStdModuleRole = devUserStdModuleRoleArray[0];
    }
    if (devUserStdModuleRole === undefined) {
      await userModuleRole.create({
        site_code: SysEnv.SITE_CODE,
        module_id: allModule.id,
        user_id: devUser.id,
        role_id: devRole.id
      });
    }
    const adminUserStdModuleRoleArray = await userModuleRole.find({
      site_code: SysEnv.SITE_CODE,
      module_id: allModule.id,
      user_id: adminUser.id,
      role_id: adminRole.id
    });
    let adminUserStdModuleRole:
      | UserModuleRoleDTO
      | UserModuleRoleData
      | undefined;
    if (adminUserStdModuleRoleArray && devUserStdModuleRoleArray.length > 0) {
      adminUserStdModuleRole = adminUserStdModuleRoleArray[0];
    }
    if (adminUserStdModuleRole === undefined) {
      await userModuleRole.create({
        site_code: SysEnv.SITE_CODE,
        module_id: allModule.id,
        user_id: adminUser.id,
        role_id: adminRole.id
      });
    }
  }

  private async createDefaultUserAccounts(
    adminAccount: any,
    adminUser: any,
    devUser: any,
    devAccount: any
  ) {
    const userAccounts = new UserAccountModel();
    let devUserAccount: UserAccountsDTO | UserAccountsData | undefined;
    let devAdminUserAccount: UserAccountsDTO | UserAccountsData | undefined;
    let adminUserAccount: UserAccountsDTO | UserAccountsData | undefined;
    const userAccountArray = await userAccounts.find({
      site_code: SysEnv.SITE_CODE
    });
    if (userAccountArray) {
      userAccountArray.forEach((userAccount) => {
        if (
          userAccount.account_id === adminAccount?.id &&
          userAccount.user_id === adminUser?.id
        ) {
          adminUserAccount = userAccount;
        } else {
          if (
            userAccount.account_id === adminAccount?.id &&
            userAccount.user_id === devUser?.id
          ) {
            devAdminUserAccount = userAccount;
          } else {
            if (
              userAccount.account_id === devAccount?.id &&
              userAccount.user_id === devUser?.id
            ) {
              devUserAccount = userAccount;
            }
          }
        }
      });
    }

    if (adminUserAccount === undefined && adminUser && adminAccount) {
      await userAccounts.create({
        user_id: adminUser.id,
        account_id: adminAccount.id
      });
    }
    if (devAdminUserAccount === undefined && devUser && adminAccount) {
      await userAccounts.create({
        user_id: devUser.id,
        account_id: adminAccount.id
      });
    }
    if (devUserAccount === undefined && devUser && devAccount) {
      await userAccounts.create({
        user_id: devUser.id,
        account_id: devAccount.id
      });
    }
  }
}
