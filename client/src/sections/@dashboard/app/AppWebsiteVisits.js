import PropTypes from 'prop-types';
import merge from 'lodash/merge';
import ReactApexChart from 'react-apexcharts';
import html2canvas from 'html2canvas';
// @mui
import { styled } from '@mui/material/styles';
import { Card, CardHeader, Box, IconButton } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
// components
import { BaseOptionChart } from '../../../components/chart';

// ----------------------------------------------------------------------

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  border: '1px solid #e9ecef',
  overflow: 'hidden',
}));

const StyledCardHeader = styled(CardHeader)(({ theme }) => ({
  '& .MuiCardHeader-title': {
    fontSize: '1.125rem',
    fontWeight: 700,
    color: '#1a1a1a',
  },
  '& .MuiCardHeader-subheader': {
    fontSize: '0.875rem',
    color: '#6c757d',
  },
}));

const DownloadButton = styled(IconButton)(({ theme }) => ({
  color: '#6c757d',
  '&:hover': {
    backgroundColor: '#f8f9fa',
    color: '#5B7FE8',
  },
}));

// ----------------------------------------------------------------------

AppWebsiteVisits.propTypes = {
  title: PropTypes.string,
  subheader: PropTypes.string,
  chartData: PropTypes.array.isRequired,
  chartLabels: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default function AppWebsiteVisits({ title, subheader, chartLabels, chartData, ...other }) {
  const chartOptions = merge(BaseOptionChart(), {
    plotOptions: {
      bar: {
        columnWidth: '50%',
        borderRadius: 4,
      },
    },
    fill: { type: chartData.map((i) => i.fill) },
    labels: chartLabels,
    xaxis: {
      categories: chartLabels,
      labels: {
        style: {
          fontSize: '12px',
          fontWeight: 500,
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: '12px',
          fontWeight: 500,
        },
      },
    },
    colors: ['#5B7FE8'],
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (y) => {
          if (typeof y !== 'undefined') {
            return `${y.toFixed(0)} items`;
          }
          return y;
        },
      },
    },
    grid: {
      borderColor: '#f1f3f5',
      strokeDashArray: 3,
    },
  });

  const handleDownloadChart = () => {
    const chartElement = document.getElementById(`website-visits-chart-${title}`);
    if (!chartElement) return;

    html2canvas(chartElement, { scale: 2 }).then((canvas) => {
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `${title}-chart.png`;
      link.click();
    });
  };

  return (
    <StyledCard {...other}>
      <StyledCardHeader
        title={title}
        subheader={subheader}
        action={
          <DownloadButton onClick={handleDownloadChart} size="small">
            <DownloadIcon fontSize="small" />
          </DownloadButton>
        }
      />
      <Box sx={{ p: 3, pb: 1 }} dir="ltr" id={`website-visits-chart-${title}`}>
        <ReactApexChart type="bar" series={chartData} options={chartOptions} height={364} />
      </Box>
    </StyledCard>
  );
}