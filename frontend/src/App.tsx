import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { backend } from 'declarations/backend';
import { Container, Typography, TextField, Button, Slider, Card, CardContent, Box, Snackbar, Grid, Avatar } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import OutdoorGrillIcon from '@mui/icons-material/OutdoorGrill';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Person {
  id: bigint;
  name: string;
  percentage: number;
  avatar: string;
}

function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<F>): Promise<ReturnType<F>> => {
    return new Promise((resolve) => {
      if (timeout) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(() => resolve(func(...args)), waitFor);
    });
  };
}

function App() {
  const [billAmount, setBillAmount] = useState<number | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [totalPercentage, setTotalPercentage] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const { control, handleSubmit } = useForm();

  const fetchBillDetails = useCallback(async () => {
    try {
      const details = await backend.getBillDetails();
      setBillAmount(details.billAmount[0] ? Number(details.billAmount[0]) : null);
      setPeople(details.people.map(p => ({
        ...p,
        id: p.id,
        percentage: Number(p.percentage),
      })));
      setTotalPercentage(Number(details.totalPercentage));
    } catch (error) {
      console.error("Error fetching bill details:", error);
      setSnackbarMessage("Error fetching bill details. Please try again.");
      setSnackbarOpen(true);
    }
  }, []);

  useEffect(() => {
    fetchBillDetails();
  }, [fetchBillDetails]);

  const onSubmitBillAmount = async (data: { billAmount: string }) => {
    const amount = parseFloat(data.billAmount);
    if (isNaN(amount)) {
      setSnackbarMessage("Invalid bill amount. Please enter a valid number.");
      setSnackbarOpen(true);
      return;
    }
    try {
      await backend.setBillAmount(amount);
      setBillAmount(amount);
      setSnackbarMessage(`Bill amount set to $${amount.toFixed(2)}`);
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarMessage("Error setting bill amount. Please try again.");
      setSnackbarOpen(true);
    }
  };

  const updatePersonPercentage = (id: bigint, percentage: number) => {
    setPeople(prevPeople => {
      const updatedPeople = prevPeople.map(p =>
        p.id === id ? { ...p, percentage } : p
      );
      const newTotalPercentage = updatedPeople.reduce((sum, p) => sum + p.percentage, 0);
      setTotalPercentage(newTotalPercentage);
      return updatedPeople;
    });
  };

  const debouncedUpdateBackend = useMemo(
    () => debounce(async (updates: [bigint, number][]) => {
      try {
        await backend.batchUpdatePercentages(updates);
      } catch (error) {
        console.error("Error updating percentages:", error);
        setSnackbarMessage("Error updating percentages. Please try again.");
        setSnackbarOpen(true);
      }
    }, 500),
    []
  );

  useEffect(() => {
    if (people.length > 0) {
      const updates = people.map(p => [p.id, p.percentage] as [bigint, number]);
      debouncedUpdateBackend(updates);
    }
  }, [people, debouncedUpdateBackend]);

  const pieChartData = {
    labels: people.map(p => p.name),
    datasets: [
      {
        data: people.map(p => p.percentage),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
        ],
      },
    ],
  };

  return (
    <Container maxWidth="lg" sx={{ height: '100vh', py: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <OutdoorGrillIcon sx={{ fontSize: 30, mr: 1, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          BBQ Dinner Bill Splitter
        </Typography>
      </Box>
      <Grid container spacing={2} sx={{ height: 'calc(100% - 60px)' }}>
        <Grid item xs={12} md={6} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {people.length > 0 ? (
              <Pie data={pieChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            ) : (
              <Typography>Loading...</Typography>
            )}
          </Box>
          <Box sx={{ mt: 2 }}>
            <form onSubmit={handleSubmit(onSubmitBillAmount)}>
              <Controller
                name="billAmount"
                control={control}
                defaultValue={billAmount?.toString() || ''}
                rules={{ required: 'Bill amount is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Total BBQ Bill"
                    type="number"
                    fullWidth
                    size="small"
                    variant="outlined"
                  />
                )}
              />
              <Button type="submit" variant="contained" color="primary" startIcon={<OutdoorGrillIcon />} fullWidth sx={{ mt: 1 }}>
                Set BBQ Bill
              </Button>
            </form>
          </Box>
        </Grid>
        <Grid item xs={12} md={6} sx={{ height: '100%', overflowY: 'auto' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {people.map((person) => (
              <Card key={person.id.toString()} sx={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
                <CardContent sx={{ p: 2 }}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Avatar src={person.avatar} alt={person.name} sx={{ width: 50, height: 50, mr: 2 }} />
                    <Typography variant="h6">{person.name}</Typography>
                  </Box>
                  <Typography variant="body2" id={`input-slider-${person.id}`} gutterBottom>
                    Share: {person.percentage}%
                  </Typography>
                  <Slider
                    value={person.percentage}
                    onChange={(_, newValue) => updatePersonPercentage(person.id, newValue as number)}
                    aria-labelledby={`input-slider-${person.id}`}
                    valueLabelDisplay="auto"
                    step={1}
                    marks
                    min={0}
                    max={100}
                  />
                  <Typography variant="body1">
                    ${billAmount ? ((billAmount * person.percentage) / 100).toFixed(2) : '0.00'}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Typography variant="h6" color={totalPercentage === 100 ? 'primary' : 'error'}>
              Total: {totalPercentage}%
            </Typography>
          </Box>
        </Grid>
      </Grid>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Container>
  );
}

export default App;
