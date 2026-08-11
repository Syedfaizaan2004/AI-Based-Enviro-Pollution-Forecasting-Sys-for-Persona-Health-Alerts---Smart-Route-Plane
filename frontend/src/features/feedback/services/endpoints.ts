export const FEEDBACK_ENDPOINTS = {
    CREATE: '/feedback/',
    GET_MY: '/feedback/me',
    GET_ALL: '/feedback/',
    UPDATE_STATUS: (id: string) => `/feedback/${id}`
};
