import { properties_schema, properties_schema_table } from './properties.schema';
import { tableIfc } from '../modules/DbModule';
import { users_schema, users_schema_table } from './users.schema';
import { accounts_schema, accounts_schema_table } from './accounts.schema';
import { userAccounts_schema, userAccounts_schema_table } from './userAccounts.schema';
import { roles_schema, roles_schema_table } from './roles.schema';
import { modules_schema, modules_schema_table } from './modules.schema';
import { userModuleRoles_schema, userModuleRoles_schema_table } from './userModuleRoles.schema';

export const sysTables: tableIfc[] = [
  {
    name: users_schema_table,
    schema: users_schema
  },

  {
    name: accounts_schema_table,
    schema: accounts_schema
  },
  {
    name: userAccounts_schema_table,
    schema: userAccounts_schema
  },
  {
    name: properties_schema_table,
    schema: properties_schema
  },
  {
    name: roles_schema_table,
    schema: roles_schema
  },
  {
    name: modules_schema_table,
    schema: modules_schema
  },
  {
    name: userModuleRoles_schema_table,
    schema: userModuleRoles_schema
  },
];
