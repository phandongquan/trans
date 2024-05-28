import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFlagCheckered } from '@fortawesome/free-solid-svg-icons'
import Rating from '~/scenes/Company/Rating';
import RatingForm from '~/scenes/Company/Rating/RatingForm'

export default [
    {
        key: 'company.rating',
        name: 'Rating',
        component: Rating,
        path: '/company/rating',
        template: 'main',
        icon: <FontAwesomeIcon icon={faFlagCheckered} />,
    },
    {
        key: 'company.rating.create',
        name: 'Rating Create',
        component: RatingForm,
        path: '/company/rating/create',
        template: 'main',
        hide: true
    },
    {
        key: 'company.rating.edit',
        name: 'Rating Edit',
        component: RatingForm,
        path: '/company/rating/:id/edit',
        template: 'main',
        hide: true
    }
];