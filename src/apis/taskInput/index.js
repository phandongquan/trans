import axios_hr from '~/utils/request_hr'

const prefix = '/hr/projects';

/**
 * Create task workflow
 * @param {*} params 
 * @returns 
 */
export const createTaskWorkflow = (data) => {
    return axios_hr({
        method: 'POST',
        data,
        url: `${prefix}/create-task-workflow`
    })
}