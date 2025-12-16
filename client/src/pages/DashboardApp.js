import { useEffect, useState } from 'react';
// @mui
import { useTheme, styled } from '@mui/material/styles';
import { 
  Grid, 
  Container, 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Card,
  CardContent,
  Box,
} from '@mui/material';
// components
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Page from '../components/Page';
// sections
import {
  AppCurrentVisits,
  AppWebsiteVisits,
  AppWidgetSummary,
  AppConversionRates,
  AppDonutChart,
} from '../sections/@dashboard/app';
import StudentDashboard from './StudentDashboard';

// ----------------------------------------------------------------------

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  border: '1px solid #e9ecef',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 6px 28px rgba(0,0,0,0.12)',
  },
}));

const PageTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.75rem',
  fontWeight: 800,
  color: '#1a1a1a',
  marginBottom: theme.spacing(4),
}));

const QuickStatLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  color: '#6c757d',
  fontWeight: 500,
  marginBottom: theme.spacing(0.5),
}));

const QuickStatValue = styled(Typography)(({ theme }) => ({
  fontSize: '1.5rem',
  fontWeight: 700,
  color: '#1a1a1a',
}));

// ----------------------------------------------------------------------

export default function DashboardApp() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [userAnalytics, setUserAnalytics] = useState({});
  const [internshipAnalytics, setInternshipAnalytics] = useState({});
  const [notificationStats, setNotificationStats] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('topSkills');
  const [loading, setLoading] = useState(true);

  const userRole = localStorage.getItem('role');
  const token = localStorage.getItem('token');

  const categoryOptions = [
    { key: 'locationStats', label: 'Location Distribution' },
    { key: 'sectorStats', label: 'Sector Distribution' },
    { key: 'skillsDemand', label: 'Skills in Demand' },
    { key: 'topCompanies', label: 'Top Companies' },
    { key: 'topSectorInterests', label: 'Popular Sector Interests' },
    { key: 'languageStats', label: 'Language Distribution' },
  ];

  useEffect(() => {
    if (userRole === 'admin') {
      fetchAdminStats();
    } else {
      setLoading(false);
    }
  }, [userRole]);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      const [dashboardRes, userRes, internshipRes, notificationRes] = await Promise.all([
        axios.get('http://localhost:7070/api/stats/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:7070/api/stats/users', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:7070/api/stats/internships', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:7070/api/stats/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(err => {
          console.warn('Notification stats not available:', err);
          return { data: {} };
        })
      ]);

      setStats(dashboardRes.data || {});
      setUserAnalytics(userRes.data || {});
      setInternshipAnalytics(internshipRes.data || {});
      setNotificationStats(notificationRes.data || {});
    } catch (error) {
      console.error("Error fetching statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  const getChartData = () => {
    let data = [];
    
    switch (selectedCategory) {
      case 'locationStats': {
        data = internshipAnalytics.locationStats || [];
        return {
          labels: data.map(item => item._id || 'Unknown'),
          values: data.map(item => item.count || 0)
        };
      }
      case 'sectorStats': {
        data = internshipAnalytics.sectorStats || [];
        return {
          labels: data.map(item => item.name || item._id || 'Unknown Sector'),
          values: data.map(item => item.count || 0)
        };
      }
      case 'skillsDemand': {
        data = internshipAnalytics.skillsDemand || [];
        return {
          labels: data.map(item => item._id || 'Unknown'),
          values: data.map(item => item.count || 0)
        };
      }
      case 'topCompanies': {
        data = internshipAnalytics.topCompanies || [];
        return {
          labels: data.map(item => item._id || 'Unknown'),
          values: data.map(item => item.count || 0)
        };
      }
      case 'topSectorInterests': {
        data = userAnalytics.topSectorInterests || [];
        return {
          labels: data.map(item => item.name || item._id || 'Unknown Sector'),
          values: data.map(item => item.count || 0)
        };
      }
      case 'languageStats': {
        data = userAnalytics.languageStats || [];
        const languageNames = {
          'en-IN': 'English',
          'hi-IN': 'Hindi',
          'ta-IN': 'Tamil',
          'mr-IN': 'Marathi',
          'gu-IN': 'Gujarati',
          'te-IN': 'Telugu',
          'kn-IN': 'Kannada',
          'ml-IN': 'Malayalam',
          'bn-IN': 'Bengali',
          'pa-IN': 'Punjabi'
        };
        return {
          labels: data.map(item => languageNames[item._id] || item._id || 'Unknown'),
          values: data.map(item => item.count || 0)
        };
      }
      default: {
        return {
          labels: [],
          values: []
        };
      }
    }
  };

  const chartData = getChartData();

  if (userRole === 'user') {  
    return <StudentDashboard />;
  }

  if (loading) {
    return (
      <Page title="Dashboard">
        <Container maxWidth="xl">
          <PageTitle>
            Loading Dashboard...
          </PageTitle>
        </Container>
      </Page>
    );
  }

  return (
    <Page title="Admin Dashboard">
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <PageTitle>
          PM Internship Scheme - Admin Dashboard
        </PageTitle>

        <Grid container spacing={3}>
          {/* Overview Stats */}
          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary
              title="Total Users"
              total={stats.overview?.totalUsers || 0}
              color="primary"
              icon="eva:people-fill"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary
              title="Total Internships"
              total={stats.overview?.totalInternships || 0}
              color="info"
              icon="eva:briefcase-fill"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary
              title="Profile Completion"
              total={`${stats.overview?.profileCompletionRate || 0}%`}
              color="success"
              icon="eva:checkmark-circle-2-fill"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary
              title="Email Notifications"
              total={`${stats.overview?.emailNotificationRate || 0}%`}
              color="warning"
              icon="eva:email-fill"
            />
          </Grid>

          {/* Recent Activity */}
          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary
              title="New Users (Week)"
              total={stats.recent?.newUsersThisWeek || 0}
              color="error"
              icon="eva:person-add-fill"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary
              title="New Internships (Week)"
              total={stats.recent?.newInternshipsThisWeek || 0}
              color="secondary"
              icon="eva:plus-circle-fill"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary
              title="Remote Opportunities"
              total={stats.internships?.remote || 0}
              color="success"
              icon="eva:home-fill"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary
              title="Total Sectors"
              total={stats.overview?.totalSectors || 0}
              color="warning"
              icon="eva:grid-fill"
            />
          </Grid>

          {/* Internship Status Distribution */}
          <Grid item xs={12} md={6} lg={4}>
            <AppCurrentVisits
              title="Internship Status"
              subheader="Current distribution of internship statuses"
              chartData={[
                { label: 'Active', value: stats.internships?.active || 0 },
                { label: 'Paused', value: stats.internships?.paused || 0 },
                { label: 'Closed', value: stats.internships?.closed || 0 },
              ]}
              chartColors={['#36B37E', '#FFAB00', '#FF5630']}
            />
          </Grid>

          {/* Email Notification Status */}
          <Grid item xs={12} md={6} lg={4}>
            <AppCurrentVisits
              title="Email Notifications"
              subheader="User email notification preferences"
              chartData={[
                { 
                  label: 'Enabled', 
                  value: (userAnalytics.emailNotificationStats || [])
                    .find(stat => stat._id === true)?.count || 0 
                },
                { 
                  label: 'Disabled', 
                  value: (userAnalytics.emailNotificationStats || [])
                    .find(stat => stat._id === false)?.count || 0 
                },
              ]}
              chartColors={['#36B37E', '#ff0000ff']}
            />
          </Grid>

          {/* Top Skills */}
          <Grid item xs={12} md={6} lg={4}>
            <AppCurrentVisits
              title="Top Skills"
              subheader="Most popular skills among users"
              chartData={(userAnalytics.topSkills || []).slice(0, 6).map(skill => ({
                label: skill._id,
                value: skill.count
              }))}
              chartColors={[
                '#5B7FE8',
                '#FF5630',
                '#8E33FF',
                '#FFAB00',
                '#36B37E',
                '#00B8D9',
              ]}
            />
          </Grid>

          {/* Category Selection */}
          <Grid item xs={12} md={6}>
            <StyledCard>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
                  Analytics Category
                </Typography>
                <FormControl fullWidth>
                  <InputLabel>Select Analytics Category</InputLabel>
                  <Select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    label="Select Analytics Category"
                    sx={{
                      borderRadius: 2,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#e9ecef',
                        borderWidth: 2,
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#dee2e6',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#5B7FE8',
                      },
                    }}
                  >
                    {categoryOptions.map((option) => (
                      <MenuItem key={option.key} value={option.key}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </CardContent>
            </StyledCard>
          </Grid>

          {/* Quick Stats Card */}
          <Grid item xs={12} md={6}>
            <StyledCard>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
                  Quick Statistics
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <QuickStatLabel>New Users This Month</QuickStatLabel>
                    <QuickStatValue>{stats.recent?.newUsersThisMonth || 0}</QuickStatValue>
                  </Grid>
                  <Grid item xs={6}>
                    <QuickStatLabel>New Internships This Month</QuickStatLabel>
                    <QuickStatValue>{stats.recent?.newInternshipsThisMonth || 0}</QuickStatValue>
                  </Grid>
                  <Grid item xs={6}>
                    <QuickStatLabel>Email Coverage</QuickStatLabel>
                    <QuickStatValue>{notificationStats.emailCoverage || 0}%</QuickStatValue>
                  </Grid>
                  <Grid item xs={6}>
                    <QuickStatLabel>Active Internships</QuickStatLabel>
                    <QuickStatValue>{stats.internships?.active || 0}</QuickStatValue>
                  </Grid>
                </Grid>
              </CardContent>
            </StyledCard>
          </Grid>

          {/* Main Analytics Chart */}
          <Grid item xs={12} lg={8}>
            <AppWebsiteVisits
              title="Analytics Overview"
              subheader={`Distribution of ${categoryOptions.find((c) => c.key === selectedCategory)?.label || 'Analytics'}`}
              chartLabels={chartData.labels}
              chartData={[
                {
                  name: categoryOptions.find((c) => c.key === selectedCategory)?.label || 'Category',
                  type: 'bar',
                  fill: 'solid',
                  data: chartData.values,
                },
              ]}
            />
          </Grid>

          {/* Distribution Pie Chart */}
          <Grid item xs={12} lg={4}>
            <AppCurrentVisits
              title="Distribution Analysis"
              subheader={`${categoryOptions.find((c) => c.key === selectedCategory)?.label || 'Analytics'} Breakdown`}
              chartData={chartData.labels.slice(0, 8).map((label, index) => ({
                label: label.length > 15 ? `${label.substring(0, 15)}...` : label,
                value: chartData.values[index] || 0,
              }))}
              chartColors={[
                '#5B7FE8',
                '#FF5630',
                '#8E33FF',
                '#FFAB00',
                '#36B37E',
                '#00B8D9',
              ]}
            />
          </Grid>

          {/* Horizontal Bar Chart */}
          <Grid item xs={12} md={6}>
            <AppConversionRates
              title="Detailed Breakdown"
              subheader={`${categoryOptions.find((c) => c.key === selectedCategory)?.label || 'Analytics'} Detailed View`}
              chartData={chartData.labels.slice(0, 10).map((label, index) => ({
                label: label.length > 20 ? `${label.substring(0, 20)}...` : label,
                value: chartData.values[index] || 0,
              }))}
            />
          </Grid>

          {/* Donut Chart */}
          <Grid item xs={12} md={6}>
            <AppDonutChart
              title="Category Distribution"
              subheader={`${categoryOptions.find((c) => c.key === selectedCategory)?.label || 'Analytics'} Overview`}
              chartData={chartData.labels.slice(0, 6).map((label, index) => ({
                label: label.length > 12 ? `${label.substring(0, 12)}...` : label,
                value: chartData.values[index] || 0,
              }))}
              chartColors={[
                '#5B7FE8',
                '#36B37E',
                '#FF5630',
                '#FFAB00',
                '#00B8D9',
                '#8E33FF',
              ]}
            />
          </Grid>
        </Grid>
      </Container>
    </Page>
  );
}