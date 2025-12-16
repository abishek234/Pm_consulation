import PropTypes from 'prop-types';
import merge from 'lodash/merge';
import ReactApexChart from 'react-apexcharts';
import html2canvas from 'html2canvas';
// @mui
import { useTheme, styled } from '@mui/material/styles';
import { Card, CardHeader, IconButton, Box } from '@mui/material';
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

const ChartWrapperStyle = styled('div')(({ theme }) => ({
  padding: theme.spacing(3),
  paddingTop: theme.spacing(1),
  '& .apexcharts-legend': {
    padding: theme.spacing(2, 0),
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

AppCurrentVisits.propTypes = {
  title: PropTypes.string,
  subheader: PropTypes.string,
  chartColors: PropTypes.arrayOf(PropTypes.string),
  chartData: PropTypes.array.isRequired,
};

export default function AppCurrentVisits({ title, subheader, chartColors, chartData, ...other }) {
  const theme = useTheme();
  const chartLabels = chartData.map((i) => i.label);
  const chartSeries = chartData.map((i) => i.value);

  const chartOptions = merge(BaseOptionChart(), {
    colors: chartColors || [
      '#5B7FE8',
      '#00B8D9',
      '#36B37E',
      '#FFAB00',
      '#FF5630',
      '#8E33FF',
    ],
    labels: chartLabels,
    stroke: { colors: [theme.palette.background.paper], width: 2 },
    legend: {
      floating: false,
      horizontalAlign: 'center',
      position: 'bottom',
      fontSize: '13px',
      fontWeight: 500,
      itemMargin: {
        horizontal: 8,
        vertical: 8,
      },
    },
    dataLabels: {
      enabled: true,
      dropShadow: { enabled: false },
      style: {
        fontSize: '12px',
        fontWeight: 600,
      },
    },
    tooltip: {
      fillSeriesColor: false,
      y: {
        formatter: (value) => `${fNumber(value)}`,
        title: { formatter: (seriesName) => `${seriesName}:` },
      },
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: false,
          },
          size: '75%',
        },
      },
    },
  });

  const handleDownloadChart = () => {
    const chartElement = document.getElementById(`current-visits-chart-${title}`);
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
      <ChartWrapperStyle dir="ltr" id={`current-visits-chart-${title}`}>
        <ReactApexChart type="pie" series={chartSeries} options={chartOptions} height={320} />
      </ChartWrapperStyle>
    </StyledCard>
  );
}