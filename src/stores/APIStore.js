import { defineStore } from 'pinia';

export const useAPIStore = defineStore('LMS_APIStore', {
  state: () => ({
    client: null,
    domainAPI: '',
    endPointGraphQL: ''
  }),
  actions: {
    setClient(client) {
      this.client = client;
    },
    getClient() {
      return this.client;
    },
    setDomainAPI(domain) {
      this.domainAPI = domain;
    },
    getDomainAPI() {
      return this.domainAPI;
    },
    setEndPointGraphQL(endPoint) {
      this.endPointGraphQL = endPoint;
    },
    getEndPointGraphQL() {
      return this.endPointGraphQL;
    }
  }
});
