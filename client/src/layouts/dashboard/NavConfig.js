// component
import Iconify from '../../components/Iconify';

// ----------------------------------------------------------------------

const getIcon = (name) => <Iconify icon={name} width={22} height={22} />;

export const getNavConfig = (userRole) =>{
  const navConfig = [];

  if (userRole === 'admin') {
    navConfig.push(
  {
    title: 'dashboard',
    path: '/dashboard/app',
    icon: getIcon('eva:pie-chart-2-fill'),
  },
  {
    title: 'user',
    path: '/dashboard/user',
    icon: getIcon('eva:people-fill'),
  },
  {
    title: 'sector',
    path: '/dashboard/sector',
    icon: getIcon('eva:grid-fill'),
  },
  {
    title: 'internship',
    path: '/dashboard/internship',
    icon: getIcon('eva:briefcase-fill'),
  },
    );
  }else if (userRole === 'user') {

    navConfig.push(
       {
    title: 'dashboard',
    path: '/dashboard/app',
    icon: getIcon('eva:pie-chart-2-fill'),
  },
  {
    title: 'Find Internships',
    path: '/dashboard/student-profile',
    icon: getIcon('eva:person-fill'),
  },
  );
} 
return navConfig;
}