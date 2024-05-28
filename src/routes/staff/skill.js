import StaffSkill from '~/scenes/Company/Staff/StaffSkill';
import StaffSkillLog from '~/scenes/Company/Staff/StaffSkillLog';

export default [
    {
        key: 'company.staff.skill',
        name: 'Staff Skill',
        component: StaffSkill,
        path: '/company/staff/:id/skill',
        template: 'main',
        hide: true,
        permission: ['hr-staff-detail-skill-list', 'hr-skill-update'],
    },
    {
        key: 'company.staff.skill.log',
        name: 'Staff Skill Log',
        component: StaffSkillLog,
        path: '/company/staff/:id/skill-log',
        template: 'main',
        hide: true
    }
];