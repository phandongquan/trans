import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHandSparkles } from '@fortawesome/free-solid-svg-icons'

import Skill from '~/scenes/Company/Skill';
import SkillForm from '~/scenes/Company/Skill/SkillForm';
import SkillStaff from '~/scenes/Company/Skill/Staff';
import SkillStaffForm from '~/scenes/Company/Skill/Staff/StaffSkillForm';
import TrainingExamination from '~/scenes/Company/TrainingExamination';
import SkillStaffLog from '~/scenes/Company/Skill/SkillLog';
import SkillReport from '~/scenes/Company/Skill/SkillReport';
import SkillRevenue from '~/scenes/Company/Skill/Revenue';
import SkillLog from '~/scenes/Company/Skill/SkillLog';
import UpraiseSkill from '~/scenes/Company/Skill/UpraiseSkill';
import SkillsCategory from '~/scenes/Company/Skill/SkillsCategory';

export default [ 
    {
        key: 'company.skill',
        name: 'Skill',
        component: Skill,
        path: '/company/skill',
        template: 'main',
        icon: <span className='icon_menu icon_skill'></span>,
        permissionOfChild: ['hr-skill-list', 'hr-skill-report-list', 'hr-skill-bonus-list', 'hr-skill-log-list', 'hr-request-skill-list'],
        children: [
            {
                key: 'company.skill',
                name: 'Skill',
                component: Skill,
                path: '/company/skill',
                template: 'main',
                permission: 'hr-skill-list',
            },
            {
                key: 'company.skill.category',
                name: 'Skill Category',
                component: SkillsCategory,
                path: '/company/skill/category',
                template: 'main',
                permission: 'hr-skill-category-list'
            },
            {
                key: 'company.skill.report',
                name: 'Skill Report',
                component: SkillReport,
                path: '/company/skill/report',
                template: 'main',
                // hide: true,
                permission: 'hr-skill-report-list'
            },
            {
                key: 'company.skill.bonus',
                name: 'Skill Bonus',
                component: SkillRevenue,
                path: '/company/skill/bonus',
                template: 'main',
                // hide: true,
                permission: 'hr-skill-bonus-list'
            },
            {
                key: 'company.skill.log',
                name: 'Skill Log',
                component: SkillLog,
                path: '/company/skill/log',
                template: 'main',
                // hide: true,
                permission: 'hr-skill-log-list'
            },
            {
                key: 'company.skill.request-upraise',
                name: 'Request Skill',
                component: UpraiseSkill,
                path: '/company/skill/request-upraise',
                template: 'main',
                // hide: true,
                permission: 'hr-request-skill-list'
            },
        ]
    },
    {
        key: 'company.skill.edit',
        name: 'Skill Edit',
        component: SkillForm,
        path: '/company/skill/:id/edit',
        template: 'main',
        hide: true,
        permission: 'hr-skill-list'
    },
    {
        key: 'company.skill.create',
        name: 'Skill Create',
        component: SkillForm,
        path: '/company/skill/create',
        template: 'main',
        hide: true,
        permission:'hr-skill-create'
    },
    {
        key: 'company.skill.staff',
        name: 'Staff List',
        component: SkillStaff,
        path: '/company/skill/:id/staff',
        template: 'main',
        hide: true
    },
    {
        key: 'company.skill.staff.create',
        name: 'Skill Staff Create',
        component: SkillStaffForm,
        path: '/company/skill/:id/staff/create',
        template: 'main',
        hide: true
    },
    {
        key: 'company.skill.staff.edit',
        name: 'Skill Staff Edit',
        component: SkillStaffForm,
        path: '/company/skill/:id/staff/:staff_skill_id/edit',
        template: 'main',
        hide: true
    },
    {
        key: 'company.skill.exam',
        name: 'Examination List',
        component: TrainingExamination,
        path: '/company/skill/:skill_id/exam',
        template: 'main',
        hide: true
    },
    {
        key: 'company.skill.staff.log',
        name: 'Staff History List',
        component: SkillStaffLog,
        path: '/company/skill/:id/staff/history',
        template: 'main',
        hide: true
    },
    {
        key: 'company.skill.detail.requestupraise',
        name: 'Skill detail Request upraise',
        component: UpraiseSkill,
        path: '/company/skill/detail/request-upraise/:id',
        template: 'main',
        hide: true,
        permission: 'hr-request-skill-list'
    },
];