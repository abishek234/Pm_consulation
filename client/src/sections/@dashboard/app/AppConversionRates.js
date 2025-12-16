import PropTypes from 'prop-types';
import merge from 'lodash/merge';
import ReactApexChart from 'react-apexcharts';
import html2canvas from 'html2canvas';
// @mui
import { styled } from '@mui/material/styles';
import { Box, Card, CardHeader, IconButton } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
// utils
import { fNumber } from '../../../utils/formatNumber';
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

AppConversionRates.propTypes = {
  title: PropTypes.string,
  subheader: PropTypes.string,
  chartData: PropTypes.array.isRequired,
};

export default function AppConversionRates({ title, subheader, chartData, ...other }) {
  const chartLabels = chartData.map((i) => i.label);
  const chartSeries = chartData.map((i) => i.value);

  const chartOptions = merge(BaseOptionChart(), {
    tooltip: {
      marker: { show: false },
      y: {
        formatter: (seriesName) => fNumber(seriesName),
        title: {
          formatter: () => '',
        },
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '50%',
        borderRadius: 4,
      },
    },
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
    grid: {
      borderColor: '#f1f3f5',
      strokeDashArray: 3,
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '11px',
        fontWeight: 600,
      },
    },
  });

  const handleDownloadChart = () => {
    const chartElement = document.getElementById(`conversion-rate-chart-${title}`);
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
      <Box sx={{ mx: 3, my: 2 }} dir="ltr" id={`conversion-rate-chart-${title}`}>
        <ReactApexChart
          type="bar"
          series={[{ data: chartSeries }]}
          options={chartOptions}
          height={364}
        />
      </Box>
    </StyledCard>
  );
}