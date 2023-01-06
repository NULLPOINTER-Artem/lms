import { defineStore } from 'pinia';
import { useClientHandle } from '@urql/vue';
import {
  queryUserInfoBody,
} from '../API/queryBodies.js';

export const roles = {
  ADMIN: 'ADMIN',
  USER: 'USER'
}

/**
 * TODO: Get user role from booking system user-store !!!
 */
export const useUser = defineStore('userLMS', {
  state: () => ({
    role: roles.ADMIN,
  }),
  actions: {
    async getUserData(user_id) {
      const handleClient = useClientHandle();

      const queryUserInfoVariables = {
        user_id: ''
      };
      const queryUserInfo = handleClient.useQuery({
        query: queryUserInfoBody,
        pause: true,
        variables: queryUserInfoVariables
      });

      queryUserInfoVariables.user_id = user_id;
      await queryUserInfo.executeQuery();

      const projects = [...queryUserInfo.data.value.user_get.workspaces[0].projects]
        .map((item) => ({
          id: item.id,
          name: item.name[0].text_value,
        }));
      const firstProject = projects[0];
      if (firstProject) localStorage.setItem('project_id', firstProject.id);
    },
    changeRole(role) {
      if (role in roles) {
        this.role = role;
      } else {
        console.warn('Incorrect role name, retry');
        console.dir(roles);
      }
    }
  }
});
