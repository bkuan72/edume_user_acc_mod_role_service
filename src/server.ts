import toobusy_js from 'toobusy-js';
import SysEnv from './modules/SysEnv';
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'dotenv/config'; // loads the .env environment
import validateEnv from './utils/validateEnv';
import App from './app';
import { AccountsController } from './server/controllers/accounts.controller';
import { UserAccountsController } from './server/controllers/userAccounts.controller';
import { UsersController } from './server/controllers/users.controller';
import { ModulesController } from './server/controllers/modules.controller';
import { RolesController } from './server/controllers/roles.controller';
import { UserModuleRolesController } from './server/controllers/userModuleRoles.controller';
import { UserAccModuleRoleController } from './server/controllers/userAccModuleRoles.controller';

// validate that all required environment variable is present
SysEnv.init();
validateEnv();

// const blacklistTokens = new TokenModel(blacklist_tokens_schema_table);
// const tokens = new TokenModel(tokens_schema_table);

const port = SysEnv.PORT;


const app = new App (
  [
    new AccountsController(),
    new UserAccountsController(),
    new UsersController(),
    new ModulesController(),
    new RolesController(),
    new UserModuleRolesController(),
    new UserAccModuleRoleController()
  ],
  port
);

app.listen();

process.on('SIGINT', function() {
  // app.close();
  // calling .shutdown allows your process to exit normally
  toobusy_js.shutdown();
  process.exit();
});

