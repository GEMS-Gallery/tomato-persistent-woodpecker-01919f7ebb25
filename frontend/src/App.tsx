import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { backend } from 'declarations/backend';
import { Container, Typography, TextField, Button, Slider, Card, CardContent, Box, Snackbar, IconButton, Grid, Avatar } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import DeleteIcon from '@mui/icons-material/Delete';
import OutdoorGrillIcon from '@mui/icons-material/OutdoorGrill';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Person {
  id: bigint;
  name: string;
  percentage: number;
  avatar?: string;
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
        avatar: p.avatar[0] || undefined
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
      console.error("Invalid bill amount");
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
      console.error("Error setting bill amount:", error);
      setSnackbarMessage("Error setting bill amount. Please try again.");
      setSnackbarOpen(true);
    }
  };

  const addPerson = async () => {
    try {
      const id = await backend.addPerson('');
      setPeople(prevPeople => [...prevPeople, { id, name: '', percentage: 0 }]);
    } catch (error) {
      console.error("Error adding person:", error);
      setSnackbarMessage("Error adding person. Please try again.");
      setSnackbarOpen(true);
    }
  };

  const updatePersonName = (id: bigint, name: string) => {
    setPeople(prevPeople =>
      prevPeople.map(p => p.id === id ? { ...p, name } : p)
    );
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
    () => debounce(async (updates: [bigint, string, number, string | null][]) => {
      try {
        await backend.batchUpdatePeople(updates);
      } catch (error) {
        console.error("Error updating people:", error);
        setSnackbarMessage("Error updating people. Please try again.");
        setSnackbarOpen(true);
      }
    }, 500),
    []
  );

  useEffect(() => {
    if (people.length > 0) {
      const updates = people.map(p => [p.id, p.name, p.percentage, p.avatar || null] as [bigint, string, number, string | null]);
      debouncedUpdateBackend(updates);
    }
  }, [people, debouncedUpdateBackend]);

  const removePerson = async (id: bigint) => {
    try {
      await backend.removePerson(id);
      setPeople(prevPeople => prevPeople.filter(p => p.id !== id));
    } catch (error) {
      console.error("Error removing person:", error);
      setSnackbarMessage("Error removing person. Please try again.");
      setSnackbarOpen(true);
    }
  };

  const pieChartData = {
    labels: people.map(p => p.name || `Person ${p.id}`),
    datasets: [
      {
        data: people.map(p => p.percentage),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
        ],
        hoverBackgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
        ],
      },
    ],
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <OutdoorGrillIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
        <Typography variant="h4" component="h1" gutterBottom>
          BBQ Dinner Bill Splitter
        </Typography>
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Box sx={{ height: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {people.length > 0 ? (
              <Pie data={pieChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            ) : (
              <Typography>Add people to see the distribution</Typography>
            )}
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
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
                  margin="normal"
                  variant="outlined"
                />
              )}
            />
            <Button type="submit" variant="contained" color="primary" startIcon={<OutdoorGrillIcon />}>
              Set BBQ Bill
            </Button>
          </form>
          {people.map((person) => (
            <Card key={person.id.toString()} sx={{ mt: 2, backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
              <CardContent>
                <Box display="flex" alignItems="center">
                  {person.avatar && (
                    <Avatar src={person.avatar} alt={person.name} sx={{ mr: 2, width: 56, height: 56 }} />
                  )}
                  <TextField
                    label="Grillmaster's Name"
                    value={person.name}
                    onChange={(e) => updatePersonName(person.id, e.target.value)}
                    fullWidth
                    margin="normal"
                  />
                </Box>
                <Typography id={`input-slider-${person.id}`} gutterBottom>
                  Share of the Feast: {person.percentage}%
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
                <Typography variant="body2">
                  Contribution: ${billAmount ? ((billAmount * person.percentage) / 100).toFixed(2) : '0.00'}
                </Typography>
                <IconButton onClick={() => removePerson(person.id)} color="secondary">
                  <DeleteIcon />
                </IconButton>
              </CardContent>
            </Card>
          ))}
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button onClick={addPerson} variant="contained" color="secondary">
              Add Grillmaster
            </Button>
            <Typography variant="h6" color={totalPercentage === 100 ? 'primary' : 'error'}>
              Total Share: {totalPercentage}%
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
