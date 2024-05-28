export default function (id, is_owner = false) {
    let result = [
        {
            title: 'Detail',
            route: `/company/projects/${id}/edit`,
        },
        // {
        //     title: 'Comment',
        //     route: `/company/projects/${id}/comment`,
        // }
    ];

    if(is_owner) {
        result.push({
            title: 'Permission',
            route: `/company/projects/${id}/permission`,
        })
    }

    return result;
}